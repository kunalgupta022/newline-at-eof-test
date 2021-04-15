const core = require('@actions/core');
const github = require('@actions/github');
const env = process.env;

async function run() {
	const token = core.getInput('GH_TOKEN');

	const octokit = github.getOctokit(token);
	const { context = {} } = github;
	const { pull_request } = context.payload;

	const owner = env.GITHUB_REPOSITORY.split('/')[0];
	const repo = env.GITHUB_REPOSITORY.split('/')[1];
	const { data: pullRequest } = await octokit.pulls.get({
		owner,
		repo,
		pull_number: pull_request.number,
		mediaType: {
			format: 'diff'
		}
	});
  core.info(pullRequest.changed_files);
	core.info(JSON.stringify(pullRequest));
}

run();
