import { readFileSync } from 'node:fs';
import { Args, Command } from '@oclif/core';
import { output } from '../../lib/spinner.js';

export default class VersionExtractNotes extends Command {
  static override args = {
    eventPath: Args.string({
      description: 'Path to the GitHub event JSON file',
      required: true,
    }),
  };

  static override description = 'Extract release notes from PR body';

  static override examples = ['<%= config.bin %> <%= command.id %> $GITHUB_EVENT_PATH'];

  public async run(): Promise<void> {
    const { args } = await this.parse(VersionExtractNotes);

    const event = JSON.parse(readFileSync(args.eventPath, 'utf8'));
    const body: string = event.pull_request?.body ?? '';

    const lines = body.split('\n');
    let inSection = false;
    const notes: Array<string> = [];

    for (const line of lines) {
      if (/^#\s*What changed\?/i.test(line)) {
        inSection = true;
      } else if (inSection && (/^#\s*Release info/i.test(line) || /^-+\s*$/.test(line))) {
        break;
      } else if (inSection) {
        notes.push(line);
      }
    }

    output(notes.join('\n').trim());
  }
}
