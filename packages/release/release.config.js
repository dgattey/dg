const preset = 'angular';

/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset,
        releaseRules: [
          {
            message: '*breaking*',
            release: 'major',
          },
          {
            tag: 'feat',
            release: 'minor',
          },
          {
            message: '*feat*',
            release: 'minor',
          },
          {
            message: '**',
            release: 'patch',
          },
          {
            header: '**',
            release: 'patch',
          },
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
        },
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset,
      },
    ],
    '@semantic-release/github',
  ],
};
