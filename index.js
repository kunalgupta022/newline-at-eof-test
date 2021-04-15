const core = require('@actions/core');
const github = require('@actions/github');
const env = process.env;

function setBuildVersion(buildVersion) {
	core.setOutput('NEXT_BUILD_VERSION', buildVersion);
}

async function listAllTags(octokit, owner, repo) {
	var page = 1;
	var tags = [];
	while (true) {
		const response = await octokit.repos.listTags({
			owner,
			repo,
			per_page: 100,
			page: page
		});
		const newTags = response['data'].map((obj) => obj['name']);

		if (!newTags.length) {
			break;
		}
		tags.push(...newTags);
		page++;
	}
	return tags;
}

async function run() {
	const token = core.getInput('GH_TOKEN');
  
  const octokit = github.getOctokit(token);
	const { context = {} } = github;
	const { pull_request } = context.payload;

  core.info(JSON.stringify(pull_request));

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
	core.info(JSON.stringify(pullRequest));

}

run();
