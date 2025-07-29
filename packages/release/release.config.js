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
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
        },
        preset,
        releaseRules: [
          {
            message: '*breaking*',
            release: 'major',
          },
          {
            release: 'minor',
            tag: 'feat',
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
