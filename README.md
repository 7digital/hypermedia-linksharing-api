Link Sharing Hypermedia API
===========================

Some Background
---------------

I've written the nodejs API client, made significant changes to the C# client
and played around with the twitter API, joyent's API, github's API and some
others.  Almost all of my experience in doing so has been fiddly and tedious!

Reading more about Hypermedia APIs (aka truly RESTful servies), I have become
more and more convinced that this technique removes a lot of this tedium.

Inspired by the Steve Klabnik talk I sent round on the weekend I thought it would be useful
to work through a real world example.  Rather than tackle our problem domain and
to avoid getting bogged down in the nuts and bolts of our system I have
used a simple link sharing example.

There are 2 clients in the clients folder.  A reference client for communicating
with the hypermedia API to demonstrate how this works and a twitter client for
comparison and to demonstrate how much extra coupling and logic is required when
not designing your API using this technique.

**BIG FAT CAVEAT**

At the time of writing the twitter client may not work as I haven't fully tested
it! :( Also due to having to do the oauth dance, the twitter client is necessarily
more complex in respect of authorisation and I had to use a module loader and oauth
library.  My hope is that this isn't to distracting and the code is close enough
to show the concepts.

I've separated the urls at the top to show the URL coupling and if you look at
the statusUpdate, friendIds and userlookup calls you will see the hardcoded
templating logic.

If this is proving problematic, when I get some more time, I'll test it all
properly and extract the templating logic to make it more explicit.

You can use the reference client like this:

```JavaScript
var linkApiClient = new SevenDigitalLinkApiClient('http://localhost:8080');

linkApiClient.start(function (err, home) {
		if (err)
			return console.error(err);

		home.getContacts(function (err, contacts) {
			if (err)
				return console.error(err);

			contacts.sendLink([ 'someid', 'anotherid' ], 'http://blah', function (err, linkSent) {
				console.log('Link sent');
				});
			});
		});
```

You can run the API stub server by doing:

    npm install
    node server.js

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
