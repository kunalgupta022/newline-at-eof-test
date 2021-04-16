const core = require('@actions/core');
const github = require('@actions/github');
const gitDiffParser = require('gitdiff-parser');
const env = process.env;

async function run() {
	const token = core.getInput('GH_TOKEN');

	const octokit = github.getOctokit(token);
	const { context = {} } = github;
	const { pull_request } = context.payload;

	const owner = env.GITHUB_REPOSITORY.split('/')[0];
	const repo = env.GITHUB_REPOSITORY.split('/')[1];
	const { data: pullRequestDiff } = await octokit.pulls.get({
		owner,
		repo,
		pull_number: pull_request.number,
		mediaType: {
			format: 'diff'
		}
	});
	core.info(JSON.stringify(pullRequestDiff));
	const parsedDiff = gitDiffParser.parse(pullRequestDiff);
  core.info(JSON.stringify(parsedDiff));
	const changedFilePaths = parsedDiff.map((e) => {
    return e['newPath']
  });
  core.info(JSON.stringify(changedFilePaths));

}

run();
