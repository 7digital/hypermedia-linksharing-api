var i, response = {
	contacts: [ ],
	forms: [
		{
			href: '/share',
			rel: 'send-link',
			data: [
				{ name: 'recipientIds', value: [] },
				{ name: 'url', value: '' }
			]
		}
	]
};

var names = ["William", "James", "John", "Robert", "Sean", "Nathan", "Andrew",
	"Jesse", "Ross", "Gregory", "Josh", "Jacob", "Jamal", "Malcolm", "Reese",
	"Dewey", "Francis", "Hal", "Jack", "Humphrey", "Eric", "Poindexter",
	"Harry", "Aaron", "Daniel", "Ethan", "Morgan", "Tyler", "Stephen",
	"Joseph", "Jeffrey", "Stewart", "Jerome", "Mario", "Michael", "Terry",
	"Nicholas", "Matthew", "Conner", "Evan", "Ryan", "Kyle", "Nathaniel",
	"Cory", "Alexander", "Donald", "Theodore", "Gabriel", "Adam", "Gary",
	"Gerald", "Jared", "Kane", "David", "Austin", "Kevin", "Joshua", "Lucas",
	"Travis", "Timothy", "Ian", "Clint", "Jason", "Colin", "Christopher",
	"Norman", "Richard", "Orville", "Orvin", "Miles", "Craig", "Vincent",
	"Anthony", "Nigel", "Patrick", "Devin", "Weston", "Marcus", "Toby",
	"Scott", "Owen", "Zachary", "Casey", "Lawrence", "Jory", "Joel", "Dylan",
	"Justin", "Alan", "Wesley", "Rupert", "Roderick", "Christian", "Damian",
	"Dominick", "Brandon", "Gage", "Phillip"];

function createDummyContact(idx) {
	var newContact = {
		"id": "id-" + names[idx] + idx * 32,
		"handle": "contact" + idx,
		"fullName": names[idx]
	};

	return newContact;
}

for (i = 0; i < 100; i++) {
	response.contacts.push(createDummyContact(i));
}

module.exports = {
	get: function get(req, res, next) {
		res.send(response);
	}
};
