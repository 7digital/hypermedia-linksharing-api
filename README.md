Link Sharing Hypermedia API
===========================

There is a sample client in the examples folder to demonstrate how this works
on the client.  The client is used like this:

```JavaScript
var linkApiClient = new SevenDigitalLinkApiClient('http://localhost:8080');

linkApiClient.start(function (err, home) {
		if (err) {
		console.dir(err);
		return;
		}

		home.getContacts(function (err, contacts) {
			if (err) {
			console.error(err);
			return;
			}
			contacts.sendLink([ 'someid', 'anotherid' ], 'http://blah',	function (err, linkSent) {
				console.log('Link sent');
				});
			});
		});
```

You can run the API server by doing:

    npm install
    node index.js

The Workflow
------------

![Workflow](https://github.com/7digital/linksharing-api/raw/master/doc/state.png)

The MediaType
-------------

**vnd.7digital.linksharing+json**

The media type is a subset of JSON, adding hypermedia and domain-specific (link sharing)
semantics.

You can make a request with the accept header from the terminal like so:

    curl -v -H "Accept: application/vnd.7digital.linksharing+json" \
            "http://localhost:8080/"

A response **MAY** contain a `contacts` key that holds an array of contact resources.
These resources **MUST** have these keys:
* `id` *string*
* `handle` *string*
* `fullName` *string*

A response **MAY** include a links key which is an array of objects. These
objects **MUST** have these keys:
* `href` *string*
* `rel` *string*

The links enable the client to transition to different states which do not
require any parameters to be passed.

The types of link are as follows (as named in the `rel` element):
* `contact-list`
* `home`

A response **MAY** include a forms key which is an array of objects. These
objects **MUST** have these keys:
* `href` *string*
* `rel` *string*
* `data` *parameter-array*

`data` will be an array of objects that **MUST** have two keys:
* `name` *string*
* `value` *mixed*

The forms enable the client to transition to different states, which do require
parameters. The client should know how to template the form parameters depending
on the type specified by `rel`.

The types of forms are as follows (as named in the `rel` element):
* `send-link`

The `links` and `forms` elements model the transitions between the states of the
system. The client should honour these fields when performing workflows.  In more
concrete terms this means that the logic should not be hardcoded.

**I.E. The only URL the client has knowledge of is the root of the API.  It can
work everything else out from the responses it receives.**
