const core = require('@actions/core');
const github = require('@actions/github');
const gitDiffParser = require('gitdiff-parser');
const fs = require('fs');
const env = process.env;

function matchExact(r, str) {
	var match = str.match(r);
	return match && str === match[0];
}

async function run() {
	const token = core.getInput('GH_TOKEN');
	var ignorePaths = ['dist/', 'package-lock.json'];
	ignorePaths = ignorePaths.map((e) => {
		if (e.slice(-1) === '/') {
			return e + '.*';
		}
	});
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
	const parsedDiff = gitDiffParser.parse(pullRequestDiff);
	const changedFilePaths = parsedDiff.map((e) => {
		return e['newPath'];
	});
	core.info(JSON.stringify(changedFilePaths));

	var filesToCheck = changedFilePaths.map((e) => {
		for (var i = 0; i < ignorePaths.length; i++) {
			if (matchExact(ignorePaths[i], e)) {
				return null;
			}
		}
		return e;
	});
	core.info(JSON.stringify(filesToCheck));

	for (var i = 0; i < filesToCheck.lenght; i++) {
		try {
      var data = fs.readFileSync(filesToCheck[i], 'utf8');
			core.info(data);
			// if (filesToCheck[i] !== null) {
			// 	var data = fs.readFileSync(filesToCheck[i], 'utf8');
			// 	core.info(data);
			// }
		} catch (e) {
			core.error('Error:', e.stack);
		}
	}
}

run();
