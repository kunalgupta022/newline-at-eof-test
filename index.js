const core = require('@actions/core');
const github = require('@actions/github');
const { parse: gitDiffParser } = require('what-the-diff');
const fs = require('fs');
const env = process.env;

function matchExact(r, str) {
	var match = str.match(r);
	return match && str === match[0];
}

function stripTrailingSpaces(b) {
	// If file is empty
	if (b.length < 1) {
		return b;
	}
	// If file is not empty
	b = b.replace(/[ \t\n]*$/, '\n');

	if (b.length === 1) {
		// if the remaining character is a space
		if (/[ \t\n]*$/.test(b)) {
			return '';
		} else {
			return b + '\n';
		}
	}
	return b;
}

async function run() {
	const token = core.getInput('GH_TOKEN');
	var ignorePaths = ['dist/', 'package-lock.json'];
	ignorePaths = ignorePaths.map((e) => {
		if (e.slice(-1) === '/') {
			return e + '.*';
		} else {
			return e;
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
  core.info(JSON.stringify(pullRequestDiff));
	const parsedDiff = gitDiffParser(pullRequestDiff);

	const changedFilePaths = parsedDiff.map((e) => {
		return e['newPath'].replace('b/','');
	});

	core.info('changedFilePaths ' + JSON.stringify(changedFilePaths));

	let filesToCheck = changedFilePaths.map((e) => {
		for (var i = 0; i < ignorePaths.length; i++) {
			if (matchExact(ignorePaths[i], e)) {
				return null;
			}
		}
		return e;
	});

	core.info(JSON.stringify(filesToCheck));


	for (var i = 0; i < filesToCheck.length; i++) {
		try {
			if (filesToCheck[i] !== null) {
				let data = fs.readFileSync(filesToCheck[i], {
					encoding: 'utf8',
					flag: 'r'
				});
				core.info(data);
				data = stripTrailingSpaces(data);
				fs.writeFileSync(filesToCheck[i], data, 'utf8');
        core.info(data);
			}
		} catch (e) {
			core.error('Error:', e.stack);
		}
	}


}

run();
