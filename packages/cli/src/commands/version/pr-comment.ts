import { readFileSync } from 'node:fs';
import https from 'node:https';
import { Args, Command, Flags } from '@oclif/core';
import { withSpinner } from '../../lib/spinner.js';

interface GithubComment {
  id: number;
  body?: string;
}

function requestGithub<T>({
  token,
  method,
  path,
  body,
}: {
  token: string;
  method: string;
  path: string;
  body?: object;
}): Promise<T> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'dg-cli-version',
      },
      hostname: 'api.github.com',
      method,
      path,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : null);
          return;
        }
        reject(new Error(`GitHub API error ${res.statusCode}: ${data}`));
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.setHeader('Content-Type', 'application/json');
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

function getRepoInfo(eventPath: string): { owner: string; repo: string; issueNumber: number } {
  const event = JSON.parse(readFileSync(eventPath, 'utf8'));
  const owner = event.repository?.owner?.login;
  const repo = event.repository?.name;
  const issueNumber = event.pull_request?.number;

  if (!owner || !repo || !issueNumber) {
    throw new Error('Missing repository or pull request info in event payload');
  }

  return { issueNumber, owner, repo };
}

export default class VersionPrComment extends Command {
  static override args = {
    eventPath: Args.string({
      description: 'Path to the GitHub event JSON file',
      required: true,
    }),
    state: Args.string({
      description: 'Comment state: "will-be" for upcoming, "released" for completed',
      options: ['will-be', 'released'],
      required: true,
    }),
    version: Args.string({
      description: 'The version to include in the comment',
      required: true,
    }),
  };

  static override description = 'Upsert a version comment on a PR';

  static override examples = [
    '<%= config.bin %> <%= command.id %> $GITHUB_EVENT_PATH 1.2.3 will-be',
    'RELEASE_URL=https://... <%= config.bin %> <%= command.id %> $GITHUB_EVENT_PATH 1.2.3 released',
  ];

  static override flags = {
    'release-url': Flags.string({
      description: 'URL to the GitHub release (required for "released" state)',
      env: 'RELEASE_URL',
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(VersionPrComment);

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN is required to update PR comments');
    }

    const { owner, repo, issueNumber } = getRepoInfo(args.eventPath);
    const marker = '<!-- release-bot-version-comment -->';
    const isReleased = args.state === 'released';
    const releaseUrl = flags['release-url'];

    if (!args.version) {
      throw new Error('Version is required to update PR comment');
    }

    if (isReleased && !releaseUrl) {
      throw new Error(
        'Release URL is required for released comment (use --release-url or RELEASE_URL env)',
      );
    }

    const body = isReleased
      ? `${marker}\n🎉 This PR is included in version ${args.version} 🎉\n\nThe release is available on [GitHub release](${releaseUrl})`
      : `${marker}\n🎉 This PR will be included in version ${args.version} 🎉`;

    await withSpinner(
      'Updating PR comment',
      async () => {
        const comments = await requestGithub<Array<GithubComment>>({
          method: 'GET',
          path: `/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=100`,
          token,
        });

        const existing = Array.isArray(comments)
          ? comments.find((comment) => comment.body?.includes(marker))
          : null;

        if (existing) {
          await requestGithub({
            body: { body },
            method: 'PATCH',
            path: `/repos/${owner}/${repo}/issues/comments/${existing.id}`,
            token,
          });
        } else {
          await requestGithub({
            body: { body },
            method: 'POST',
            path: `/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
            token,
          });
        }
      },
      { successText: 'PR comment updated' },
    );
  }
}
