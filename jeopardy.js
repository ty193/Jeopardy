let categories = [];
let categorieIds = [];

function getCategoryIds() {
	return _.sampleSize(categorieIds, 6);
}

function getCategory(catId) {
	return categories.find((category) => category.id === +catId);
}

async function fillTable() {
	categories = [];
	const ids = getCategoryIds();
	for (let i = 0; i < ids.length; i++) {
		try {
			let result = await axios.get(`http://jservice.io/api/category?id=${ids[i]}`);
			categories.push(result.data);
			result.data.clues = result.data.clues.map((clue) => {
				clue.parentId = result.data.id;
				clue.showing = null;
				return clue;
			});
		} catch (e) {
			alert('Error fetching catagory');
		}
	}
	const tableHeader = $('thead')[0];
	const tableContent = $('tbody')[0];
	let bodyContent = '';
	let headerContent = '';
	let tableRows = [ [], [], [], [], [] ];
	categories.forEach((category, i) => {
		headerContent += `<td>${category.title}</td>`;
		for (let j = 0; j < 5; j++) {
			tableRows[j].push(category.clues[j]);
		}
	});
	tableRows.forEach((row) => {
		bodyContent += `<tr>${row.map((clue) => {
			return `<td id="${clue.parentId}-${clue.id}">?</td>`;
		})}</tr>`;
	});
	tableHeader.innerHTML = `<tr>${headerContent}</tr>`;
	tableContent.innerHTML = bodyContent;

	$('td').click(tableDataClick);
}

function tableDataClick(e) {
	let target = e.target;
	if (target.id) {
		const idArray = target.id.split('-');
		const category = getCategory(idArray[0]);
		const clue = category.clues.find((clue) => clue.id === +idArray[1]);
		if (clue.showing) {
			target.innerHTML = clue.answer;
		} else {
			target.innerHTML = clue.question;
			clue.showing = true;
		}
	}
}

function handleClick(evt) {
	fillTable();
}

$('#restart').click(handleClick);

async function setupAndStart() {
	try {
		const results = await axios.get('http://jservice.io/api/categories?count=100');
		categorieIds = results.data.map((result) => result.id);
		console.log(categorieIds);
		fillTable();
	} catch (e) {
		alert('Error fetching data');
	}
}

setupAndStart();
