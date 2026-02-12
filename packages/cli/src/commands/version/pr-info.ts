import { readFileSync } from 'node:fs';
import { Args, Command } from '@oclif/core';
import { output } from '../../lib/spinner.js';

export default class VersionPrInfo extends Command {
  static override args = {
    eventPath: Args.string({
      description: 'Path to the GitHub event JSON file',
      required: true,
    }),
  };

  static override description = 'Parse release type from PR event (Major/Minor/Patch checkboxes)';

  static override examples = ['<%= config.bin %> <%= command.id %> $GITHUB_EVENT_PATH'];

  public async run(): Promise<void> {
    const { args } = await this.parse(VersionPrInfo);

    const event = JSON.parse(readFileSync(args.eventPath, 'utf8'));
    const body: string = event.pull_request?.body ?? '';

    // Check which release type checkbox is checked (Major > Minor > Patch)
    const releaseType = /- \[x\]\s*Major/i.test(body)
      ? 'major'
      : /- \[x\]\s*Minor/i.test(body)
        ? 'minor'
        : 'patch';

    output(`RELEASE_TYPE=${releaseType}`);
  }
}
