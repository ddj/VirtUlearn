// (C) Copyright 2011 Active Web Solutions Ltd
//     All rights reserved.
// This software is provided "as is" without warranty of any kind, express or
// implied, including but not limited to warranties as to quality and fitness
// for a particular purpose. Active Web Solutions Ltd does not support the
// Software, nor does it warrant that the Software will meet your requirements or
// that the operation of the Software will be uninterrupted or error free or that
// any defects will be corrected. Nothing in this statement is intended to limit
// or exclude any liability for personal injury or death caused by the negligence
// of Active Web Solutions Ltd, its employees, contractors or agents.

var crypto = require('crypto');
var url = require('url');
var http = require('http');
var https = require('https');
var sys = require('util');
var fs = require('fs');
var xml2js = require('node-xml2js');

// HTTP Response codes
const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_ACCEPTED = 202;
const HTTP_NO_CONTENT = 204;

var nl = '\n';	// Newline

// Support for developer fabric
exports.devstore_account = {
	name : "devstoreaccount1",
	key : "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==",
	blob_storage_url : "http://127.0.0.1:10000/devstoreaccount1",
	table_storage_url : "http://127.0.0.1:10002/devstoreaccount1",
	queue_storage_url : "http://127.0.0.1:10001/devstoreaccount1"
}

// Specifiy your own account like this
exports.sample_account = {
	name : "YOURACCOUNTNAME",
	key : "YOURACCOUNTKEY",
	blob_storage_url : "https://YOURACCOUNTNAME.blob.core.windows.net",
	table_storage_url : "https://YOURACCOUNTNAME.table.core.windows.net",
	queue_storage_url : "https://YOURACCOUNTNAME.queue.core.windows.net"
}

/*****************************
* Core request functionality *
*****************************/

exports.create_unique_id_64 = function(){
	return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx='.replace(/[x]/g, function(c) {
		var r = Math.random()*35|0, v = r;
		return v.toString(36);
	});
}

exports.hmac_string = function(key, str) {
	var secret = (new Buffer(key, 'base64')).toString('binary');
	var hmac = crypto.createHmac('sha256', secret);
	return hmac.update(str).digest('base64');
}

function to_array (x) {
	var a = [];
	for (var k in x)
	      a.push([k, x[k]]);

	return a;
}

String.prototype.startsWith = function(str) {
	return (this.indexOf(str) === 0);
}

exports.canonicalized_headers = function(req) { 
	var h = to_array(req.headers).sort();
	var buffer = '';

	for (var k in h)
	{
		if (h[k][0].startsWith('x-ms-'))
			buffer += h[k][0] + ":" + h[k][1] + nl;
	}

	return buffer
}

// Expand the URL to make the request suitable for the HTTP or HTTPS modules
function requestify (req) {
	var x = url.parse(req.url,true);
	req.host = x.hostname;
	req.path = x.pathname + x.search;
    	req.port = x.port;
	if (x.protocol == 'http:') {
		req.client = http;
	}
	if (x.protocol == 'https:') {
		req.client = https;
	}
}

exports.canonicalized_resource_format_1 = function(name, req)  {
	var x = url.parse(req.url,true);
	
	var s = "/" + name + x.pathname;

	// http://msdn.microsoft.com/en-us/library/windowsazure/dd179428.aspx
	for (k in x.query)  {
		// don't add dollar parameters (i.e. the table queries)
		if (k.charAt(0) != "$")
		{
			s += nl + k + ":" + x.query[k];
		}
	}
	return s;
}

function optional (x) {
	return (x ? x : "");
}

string_to_sign_1 = function(name, req) {
	return "" +
	req.method + nl +
	optional(req.headers['Content-Encoding']) + nl +
	optional(req.headers['Content-Language']) + nl +
	optional(req.headers['Content-Length']) + nl +
	optional(req.headers['Content-MD5']) + nl +
	optional(req.headers['Content-Type']) + nl +
	optional(req.headers['Date']) + nl +
	optional(req.headers['If-Modified-Since']) + nl +
	optional(req.headers['If-Match']) + nl +
	optional(req.headers['If-None-Match']) + nl +
	optional(req.headers['If-Unmodified-Since']) + nl +
	optional(req.headers['Range']) + nl +
	exports.canonicalized_headers(req) +
	exports.canonicalized_resource_format_1(name,req);
}

string_to_sign_2 = function(name, req) {
	return "" +
	req.method + nl +
	optional(req.headers['Content-MD5']) + nl +
	optional(req.headers['Content-Type']) + nl +
	optional(req.headers['Date']) + nl +
	exports.canonicalized_resource_format_1(name,req);
}

stripUtf8Char = function (value) {
	if (value.charCodeAt(0) == 65279) {
		return value.substr(1, value.length -1);
	}
	else {
		return value;
	}
}

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

function get_urlencoded_date(date){
	const colon = ":"; //"%3a";
	return pad(date.getUTCFullYear(),4) + '-' +
	pad(date.getUTCMonth(), 2) + '-' +
	pad(date.getUTCDay(), 2) + 'T' +
	pad(date.getUTCHours(), 2) + colon +
	pad(date.getUTCMinutes(), 2) + colon +
	pad(date.getUTCSeconds(), 2) + '.0000000Z';
}

// Useful for debugging
exports.show_response = function(res) {
	console.log('STATUS: ' + res.statusCode);
	console.log('HEADERS: ' + JSON.stringify(res.headers));
        
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
		console.log('DATA: ' );
		console.log(chunk);
	});

	res.on('error', function(e) {
		console.log("ERROR: " + e.message);
	});

	res.on('end', function() {
		console.log("END: ");
	});
}


exports.raw_body = function(res , cb) {
    var fn = cb || function(x) {console.log(x);};

    if (res.statusCode == HTTP_OK) {
        res.on('data', function (chunk) {
		                   fn(chunk);
	                   });
    } else {
        fn(undefined);
    }
}

function response_to_json(res, cb) {
	var data = "";
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
		data = data + chunk;
	});
	res.on('end', function () {
		//console.log(data); // this line will give you the raw XML
		var parser = new xml2js.Parser();
		parser.on('end', cb);
		parser.parseString(stripUtf8Char(data));
	});
}

function shared_key_for_blob_and_queue_services (account, req) {
	req.headers =  req.headers || {};
	req.headers['x-ms-date'] = (new Date()).toUTCString();

	//if (req.x_ms_blob_type != undefined)
	//	req.headers['x-ms-blob-type'] = req.x_ms_blob_type;
		
	//if (req.body != undefined)
	//	req.headers['Content-Length'] = req.body.length;
  
	req.headers['x-ms-version'] =  '2009-09-19';

	var s = string_to_sign_1(account.name, req);

	req.headers['Authorization'] = "SharedKey " + 
		account.name + ":" +
		exports.hmac_string(account.key,s );
}

function shared_key_for_table_service (account, req) {
	req.headers =  req.headers || {};
	req.headers['x-ms-date'] = (new Date()).toUTCString();

	if (req.body != undefined)
		req.headers['Content-Length'] = req.body.length;
  
	req.headers['x-ms-version'] =  '2009-09-19';
	req.headers['DataServiceVersion'] = "1.0;NetFx" // Needed for 2009-09-19
	req.headers['MaxDataServiceVersion'] = "2.0;NetFx" //Needed for 2009-09-19

	req.headers['Date'] = req.headers['x-ms-date'];
  
	var s = string_to_sign_2(account.name, req);
	
	req.headers['Authorization'] = "SharedKey " + 
		account.name + ":" +
		exports.hmac_string(account.key,s );
}

function execute (req, cb) {
	requestify(req);
	//console.log(req.headers);
	var r = req.client.request(req, cb);

	if (req.body != undefined) {
		r.write(req.body, encoding='utf8');
	}

	r.end();
}

/*******************
* Blob Service API *
*******************/

exports.blob = {
	core: {

		list_containers: function(account, cb) {
			var req = {
				url: account.blob_storage_url
					 + '/?comp=list',
				method: 'GET'
			};
			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},

		create_container: function(account, container_name, cb) {
			var req = {
				url: account.blob_storage_url
					 + '/' + container_name
					 + '?restype=container',
				method: 'PUT'
			};
			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},

		get_container_properties: function(account, container_name, cb) {
			var req = {
				url: account.blob_storage_url
					 + '/' + container_name
					 + '?restype=container',
				method: 'HEAD'
			};
			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},

		get_container_metadata: function(account, container_name, cb) {
			var req = {
				url: account.blob_storage_url
					 + '/' + container_name
					 + '?comp=metadata&restype=container',
				method: 'HEAD'
			};
			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},

		set_container_metadata: function(account, container_name, meta, cb) {
			var meta_headers = {};
			for(key in meta) {
				if (key.indexOf('x-ms-meta') == 0) {
					meta_headers[key] = meta[key];
				} else {
					meta_headers['x-ms-meta-' + key] = meta[key];
				}
			}
			var req = {
				url: account.blob_storage_url
					 + '/' + container_name
					 + '?comp=metadata&restype=container',
				method: 'PUT',
				headers: meta_headers
			}
			shared_key_for_blob_and_queue_services(account, req);
			execute(req, cb);
		},

		// TODO Get Container ACL
		// TODO Set Container ACL

		delete_container: function(account, container_name, cb) {
			var req = {
				url: account.blob_storage_url
					 + '/' + container_name
					 + '?restype=container',
				method: 'DELETE'
			};

			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},

		list_blobs: function(account, container_name, cb) {
			var req = {
				url: account.blob_storage_url
					 + '/' + container_name
					 + '?comp=list&restype=container',
				method: 'GET'
				};
		  
			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},



		put_blob: function(account, container_name, blob_type, blob_name, content, content_headers, cb) {
			var req = {
				url: account.blob_storage_url + '/' + container_name + '/' + blob_name,
				method: 'PUT',
				headers: {
					'x-ms-blob-type': blob_type,
					'Content-Length': content.length },
				body: content
			};
			for(ch in content_headers) {
				req.headers[ch] = content_headers[ch];
			}

			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},

		get_blob: function(account, container_name, blob_name, cb) {
			var req = {
				url: account.blob_storage_url
					 + '/' + container_name
					 + '/' + blob_name,
				method: 'GET'
			};
		  
			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},

		// TODO Get Blob Properties
		// TODO Set Blob Properties
		// TODO Get Blob Metadata
		// TODO Set Blob Metadata
		
		get_container_acl: function(account, container_name, cb){
			var req = {
				url: account.blob_storage_url + '/' + container_name + "?comp=acl&restype=container",
				method: 'GET'
			};
		  
			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},
		
		set_container_acl: function(account, container_name, xml, cb){
			var req = {
				url: account.blob_storage_url + '/' + container_name + "?comp=acl&restype=container",
				method: 'PUT',
				body:xml,
				headers : {'Content-Length': xml.length}
			};
		  
			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},

		delete_blob: function(account, container_name, blob_name, cb) {
			var req = {
				url: account.blob_storage_url
					 + '/' + container_name
					 + '/' + blob_name,
				method: 'DELETE'
			};

			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},

		// TODO Lease Blob
		// TODO Snapshot Blob
		// TODO Copy Blob
		// TODO Put Block
		// TODO Put Block List
		// TODO Get Block List
		// TODO Put Page
		// TODO Get Page Regions

		download_blob: function(account, container_name, blob_name, file_name, cb) {
				var fn = cb || function(x) {console.log(file_name + ' saved.' + x);};

				var s = fs.createWriteStream(file_name);
				s.on('close', fn);

				var f = function(x) { 
					raw_body(x, function(x) {s.write(x);})
				}

			get_blob(account, container_name, blob_name, f)
		}
		
	},

	list_containers: function(account, cb){
		this.core.list_containers(account, function(res){
			response_to_json(res, function(result){
				if (result.Containers != undefined) {
					if (result.Containers.Container instanceof Array) {
						if (undefined != cb) cb(result.Containers.Container);
					}
					else {
						var array = new Array();
						array[0] = result.Containers.Container;
						if (undefined != cb) cb(array);
					}
				}
			})
		});
	},
	
	create_container: function(account, container_name, cb) {
		this.core.create_container(account, container_name, function(res){
			if (undefined != cb) cb(res.statusCode == HTTP_CREATED);
		});
	},
	
	get_container_properties: function(account, container_name, cb) {
		this.core.get_container_properties(account, container_name, function(res){
			response_to_json(res, function(result){
				// do transform here?
				if (undefined != cb) cb(result);
			});
		});
	},
	
	get_container_metadata: function(account, container_name, cb) {
		this.core.get_container_metadata(account, container_name, function(res){
			response_to_json(res, function(result){
				if (undefined != cb) cb(result);
			});
		});
	},
	
	set_container_metadata: function(account, container_name, meta, cb) {
		this.core.set_container_metadata(account, container_name, meta, function(res){
			if (undefined != cb) cb(res.statusCode == HTTP_OK);
		});
	},
	
	delete_container: function(account, container_name, cb) {
		this.core.delete_container(account, container_name, function(res){
			if (undefined != cb) cb(res.statusCode == HTTP_ACCEPTED);
		});
	},
	
	list_blobs: function(account, container_name, cb) {
		this.core.list_blobs(account, container_name, function(res){
			response_to_json(res, function(result){
				// do transform here?
				var array = new Array();
				if (result.Blobs != undefined && result.Blobs.Blob != undefined){
					if (result.Blobs.Blob instanceof Array) {
						array = result.Blobs.Blob;
					}
					else {
						array[0] = result.Blobs.Blob;
					}
				}
				if (undefined != cb) cb(array);
			});
		});
	},
	
	BlockBlob: "BlockBlob",
	PageBlob: "PageBlob",
	
	put_blob: function(account, container_name, blob_type, blob_name, content, content_headers, cb) {
		this.core.put_blob(account, container_name, blob_type, blob_name, content, content_headers, function(res){
			if (undefined != cb) cb(res.statusCode == HTTP_CREATED);
		});
	},
	
	get_blob: function(account, container_name, blob_name, cb) {
		this.core.get_blob(account, container_name, blob_name, function(res){
		
			if (res.statusCode == HTTP_OK) {
				var data = "";
				res.on('data', function (chunk) {
					data = data + chunk;
				});
				res.on('end', function () {
					if (cb != undefined) cb(data);
				});
			}
			else {
				if (cb != undefined) cb();
			}
		});
	},
	
	delete_blob: function(account, container_name, blob_name, cb) {
		this.core.delete_blob(account, container_name, blob_name, function(res){
			if (undefined != cb) cb(res.statusCode == HTTP_ACCEPTED);
		});
	},
		
	get_container_acl: function(account, container_name, cb){
		this.core.get_container_acl(account, container_name, function(res){
			response_to_json(res, function(result){
				// do transform here?
				if (undefined != result.SignedIdentifier) {
					if (undefined != cb) cb(result.SignedIdentifier);
				}
				else {
					cb();
				}
				
			});
		});
	},
	
	// an id will be created for you if you leave it undefined.
	// acls can be an array or single object.
	/*
	{
		Id: 'Unique-Id',
		AccessPolicy:{
			Start: 'start time',
			Expiry: 'expiry time',
			Permission: 'rwd'
		}
	}
	
	*/
	set_container_acl: function(account, container_name, acls, cb){
		
		var convert_acl_to_xml = function(acl){
			id = acl.Id;
			if (id == undefined) {
				id = exports.create_unique_id_64();
			}
			return "<SignedIdentifier>\n<Id>" + id + "</Id>\n<AccessPolicy>\n<Start>" + get_urlencoded_date(acl.AccessPolicy.Start) + "</Start>\n<Expiry>" + get_urlencoded_date(acl.AccessPolicy.Expiry) + "</Expiry>\n<Permission>" + acl.AccessPolicy.Permission + "</Permission>\n</AccessPolicy>\n</SignedIdentifier>\n";
		}
		var xml = '<?xml version="1.0" encoding="utf-8"?>\n<SignedIdentifiers>\n';
		if (acls instanceof Array){
			for ( var i=0, len=acl.length; i<len; ++i ){
					
				xml = xml + convert_acl_to_xml(acls[i]);
			}
		}
		else {
			if (acls != undefined){
				xml = xml + convert_acl_to_xml(acls);
			}
		}
		xml = xml + "</SignedIdentifiers>";
		
		this.core.set_container_acl(account, container_name, xml, function(res){	
			exports.show_response(res);
			if (undefined != cb) cb(res.statusCode == HTTP_OK);		
		});
	},

}

/********************
* Queue Service API *
********************/

exports.queues = {

	core: {

		list_queues: function(account, cb) {
			var req = {
				url: account.queue_storage_url + '/?comp=list',
				method: 'GET'
			};
			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},
		
		create_queue: function(account, queue_name, cb) {
			var req = {
				url: account.queue_storage_url + '/' + queue_name,
				method: 'PUT'
			};
			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},

		delete_queue: function(account, queue_name, cb) {
			var req = {
				url: account.queue_storage_url + '/' + queue_name,
				method: 'DELETE'
			};
			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},

		put_message: function(account, queue_name, content, cb) {
			var req = {
				url: account.queue_storage_url + '/' + queue_name + '/messages',
				method: 'POST',
				body: content
			};
			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},
		
		get_messages: function(account, queue_name, count, peek, cb){
			var req = {
				url: account.queue_storage_url + '/' + queue_name + '/messages?numofmessages=' + count,
				method: 'GET'
			};
			if (peek){
				req.url = req.url + "&peekonly=true";
			}
			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},
		
		delete_message: function(account, queue_name, messageid, popreceipt, cb){
			var req = {
				url: account.queue_storage_url + '/' + queue_name + '/messages/' + messageid + "?popreceipt=" + popreceipt.replace("=", "%3D"),
				method: 'DELETE'
			};
			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},
		
		clear_messages: function(account, queue_name, cb){
			var req = {
				url: account.queue_storage_url + '/' + queue_name + '/messages',
				method: 'DELETE'
			};
			shared_key_for_blob_and_queue_services(account,req);
			execute(req, cb);
		},
		
	},
	
	list_queues: function(account, cb) {
		this.core.list_queues(account, function(res) {
			response_to_json(res, function(result){
				var results = new Array();
				if (result.Queues.Queue instanceof Array) {
					for ( var i=0, len=result.Queues.Queue.length; i<len; ++i ){
						results[i] = {name: result.Queues.Queue[i].Name, url: result.Queues.Queue[i].Url};
					}
				}
				else {
					if (result.Queues != undefined) {
						results[0] = {name: result.Queues.Queue.Name, url: result.Queues.Queue.Url};
					}
				}
				if (undefined != cb) cb(results);
			})
		});
		
	},
	
	create_queue: function(account, queue_name, cb){
		this.core.create_queue(account, queue_name, function(res){
			if (undefined != cb) cb(res.statusCode == HTTP_CREATED);
		});
	},
	
	delete_queue: function(account, queue_name, cb) {
		this.core.delete_queue(account, queue_name, function(res){
			if (cb != undefined) 
			{
				if (undefined != cb) cb(res.statusCode == HTTP_NO_CONTENT); 
			}
		});
	},

	put_message: function(account, queue_name, data, cb) {
		var xml = "<QueueMessage><MessageText><![CDATA[" + JSON.stringify(data) + "]]></MessageText></QueueMessage>";
		this.core.put_message(account, queue_name, xml, function(res){
			if (undefined != cb) cb(res.statusCode == HTTP_CREATED);
		});
	},
	
	get_message: function(account, queue_name, cb){
		exports.queues.get_messages(account, queue_name, 1, function(messages){
			if (undefined != cb) cb(messages[0]);
		});
	},
	
	get_messages: function(account, queue_name, count, cb){
		this.core.get_messages(account, queue_name, count, false, function(res){
			response_to_json(res, function(result){
				var results = new Array();
				if (result.QueueMessage instanceof Array) {
					for ( var i=0, len=result.QueueMessage.length; i<len; ++i ){
						results[i] = result.QueueMessage[i];
						results[i].Data = JSON.parse(result.QueueMessage[i].MessageText);
					}
				}
				else {
					if (result.QueueMessage != undefined) {
						results[0] = result.QueueMessage;
						results[0].Data = JSON.parse(result.QueueMessage.MessageText);
					}
				}
				if (undefined != cb) cb(results);
			});
		});
	},
	
	peek_message: function(account, queue_name, cb){
		exports.queues.peek_messages(account, queue_name, 1, function(messages){
			if (undefined != cb) cb(messages[0]);
		});
	},
	
	// TODO: REFACTOR THIS, MAKE IT MORE DRY
	peek_messages: function(account, queue_name, count, cb){
		this.core.get_messages(account, queue_name, count, true, function(res){
			response_to_json(res, function(result){
				var results = new Array();
				if (result.QueueMessage instanceof Array) {
					for ( var i=0, len=result.QueueMessage.length; i<len; ++i ){
						results[i] = result.QueueMessage[i];
						results[i].Data = JSON.parse(result.QueueMessage[i].MessageText);
					}
				}
				else {
					if (result.QueueMessage != undefined) {
						results[0] = result.QueueMessage;
						results[0].Data = JSON.parse(result.QueueMessage.MessageText);
					}
				}
				if (undefined != cb) cb(results);
			});
		});
	},
	
	delete_message: function(account, queue_name, message, cb){
		this.core.delete_message(account, queue_name, message.MessageId, message.PopReceipt, function(res){
			if (undefined != cb) cb(res.statusCode == HTTP_NO_CONTENT);
		});
	
	},
	
	clear_messages: function(account, queue_name, cb){
		this.core.clear_messages(account, queue_name, function(res){
			if (undefined != cb) cb(res.statusCode == HTTP_NO_CONTENT);
		});
	},
	
	
	// TODO Get Queue Metadata
	// TODO Set Queue Metadata

}


/********************
* Table Service API *
********************/

exports.tables = {

	core: {
	
		query_tables: function (account, cb) {
			var req = {
				url: account.table_storage_url + '/Tables',
				method: 'GET'
			};
			shared_key_for_table_service(account,req);
			execute(req, cb);
		},
		
		create_table: function (account, xml, cb) {
			var req = {
				url: account.table_storage_url + '/Tables',
				method: 'POST',
				body: xml,
				headers : {'Content-Type': 'application/atom+xml'}
			};
			shared_key_for_table_service(account,req);
			execute(req, cb);
		},
		
		
		delete_table: function(account, tablename, cb) {
			var req = { 
				url: account.table_storage_url + "/Tables('" + tablename + "')",
				method: 'DELETE',
				headers : {'Content-Type': 'application/atom+xml'}
			};
			shared_key_for_table_service(account,req);
			execute(req, cb);
		},
			
		insert_entity: function (account, tablename, xml, cb) {
			var req = { 
				url: account.table_storage_url + '/' + tablename,
				method: 'POST',
				body: xml,
				headers : {'Content-Type': 'application/atom+xml'}
			};
			shared_key_for_table_service(account,req);
			execute(req, cb);
		},
			
		update_entity: function (account, tablename, xml, partitionKey, rowKey, cb) {
			var req = { 
				url: account.table_storage_url + '/' + tablename + "(PartitionKey='" + partitionKey + "',RowKey='" + rowKey + "')",
				method: 'PUT',
				body: xml,
				headers : {'Content-Type': 'application/atom+xml', 'If-Match': '*'}
			};
			shared_key_for_table_service(account,req);
			execute(req, cb);
		},
		
		get_entity: function(account, tablename, partitionKey, rowKey, cb) {
			var req = { 
				url: account.table_storage_url + '/' + tablename + "(PartitionKey='" + partitionKey + "',RowKey='" + rowKey + "')",
				method: 'GET'
			};
			shared_key_for_table_service(account,req);
			execute(req, cb);
		},
		
		query_entities: function(account, tablename, query, cb){
			var req = { 
				url: account.table_storage_url + '/' + tablename + "()?$filter=" + query,
				method: 'GET'
			};
			shared_key_for_table_service(account,req);
			execute(req, cb);
		},
		
		delete_entity: function(account, tablename, partitionKey, rowKey, cb) {
			var req = { 
				url: account.table_storage_url + '/' + tablename + "(PartitionKey='" + partitionKey + "',RowKey='" + rowKey + "')",
				method: 'DELETE',
				headers : {'Content-Type': 'application/atom+xml', 'If-Match': '*'}
			};
			shared_key_for_table_service(account,req);
			execute(req, cb);
		}
		
	},


	entry_to_entity: function (entry) {
		var entity = {};
		for (var propertyName in entry.content['m:properties']) {
			if (propertyName == "d:Timestamp") {
				entity[propertyName.replace("d:", "")] = entry.content['m:properties'][propertyName]['#'];
			}
			else {
				entity[propertyName.replace("d:", "")] = entry.content['m:properties'][propertyName];
			}
		}
		return entity;
	},

	// callback has an argument which is an array of objects with a 'TableName' property
	query_tables: function (account, cb) {
	  
		this.core.query_tables(account, function(res){
			response_to_json(res, function(result){
				var results = new Array();
				for ( var i=0, len=result.entry.length; i<len; ++i ){
					results[i] = { TableName : result.entry[i].content['m:properties']['d:TableName'] };
				}
				if (undefined != cb) cb(results);
			})
		});
	},

	// callback contains the response
	create_table: function (account, table_name, cb) {
	  
		var xml = "<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"yes\"?><entry xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xmlns=\"http://www.w3.org/2005/Atom\"><title />     <updated>2009-03-18T11:48:34.9840639-07:00</updated><author><name/></author><id/><content type=\"application/xml\"><m:properties><d:TableName>" + table_name + "</d:TableName></m:properties></content></entry>";

		this.core.create_table(account, xml, function(res){
			if (undefined != cb) cb(res.statusCode == HTTP_CREATED);
		});
	},

	// callback has a bool argument indicating success
	delete_table: function(account, tablename, cb) {
		
		this.core.delete_table(account, tablename, function(res){
			if (undefined != cb) cb(res.statusCode == HTTP_NO_CONTENT);
		});	
	},

	// callback contains the response
	insert_entity: function (account, tablename, data, cb) {

		var xml = '<?xml version="1.0" encoding="utf-8" standalone="yes"?><entry xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom"><title /><updated>2009-03-18T11:48:34.9840639-07:00</updated><author><name /></author><id /><content type="application/xml"><m:properties>';
		xml = xml + '<d:Timestamp m:type="Edm.DateTime">0001-01-01T00:00:00</d:Timestamp>';
		for(var propertyName in data) { 
			xml = xml + "<d:" + propertyName + ">" + data[propertyName] + "</d:" + propertyName + ">";
		}
		xml = xml + '</m:properties></content></entry>';
		
		this.core.insert_entity(account, tablename, xml, function(res){
			if (undefined != cb) cb(res.statusCode == HTTP_CREATED);
		});
		
	},

	// callback contains the response
	update_entity: function (account, tablename, data, cb) {
		var url = account.table_storage_url + '/' + tablename + "(PartitionKey='" + data.PartitionKey + "',RowKey='" + data.RowKey + "')";

		var xml = '<?xml version="1.0" encoding="utf-8" standalone="yes"?><entry xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom"><title /><updated>2009-03-18T11:48:34.9840639-07:00</updated><author><name /></author><id>' + url + '</id><content type="application/xml"><m:properties>';
		xml = xml + '<d:Timestamp m:type="Edm.DateTime">0001-01-01T00:00:00</d:Timestamp>';
		
		for(var propertyName in data) { 
			xml = xml + "<d:" + propertyName + ">" + data[propertyName] + "</d:" + propertyName + ">";
		}
		xml = xml + '</m:properties></content></entry>';
		
		this.core.update_entity(account, tablename, xml, data.PartitionKey, data.RowKey, function(res){
			if (undefined != cb) cb(res.statusCode == HTTP_NO_CONTENT);
		});
		
	},

	// callback has an argument containing the matching entity
	get_entity: function(account, tablename, partitionKey, rowKey, cb) {
		
		this.core.get_entity(account, tablename, partitionKey, rowKey, function(res){ 
			response_to_json(res, function(result){
				
				if (result.content == undefined) {
					if (undefined != cb) cb();
				}
				else {
					if (undefined != cb) cb(exports.tables.entry_to_entity(result));
				}
			})
		});
	},


	// callback has an argument which is a list of matching entities
	query_entities: function(account, tablename, query, cb){

		this.core.query_entities(account, tablename, query, function(res){ 
			response_to_json(res, function(result){
				var entities = new Array();
				
				if (result.entry instanceof Array) {
					for ( var i=0, len=result.entry.length; i<len; ++i ){
						entities[i] = exports.tables.entry_to_entity(result.entry[i]);
					}
				}
				else {
					if (result.entry != undefined) {
						entities[0] = exports.tables.entry_to_entity(result.entry);
					}
				}
				if (undefined != cb) cb(entities);
			})
		});
	},

	// callback has a bool argument, indicating success
	delete_entity: function(account, tablename, partitionKey, rowKey, cb) {
	
		this.core.delete_entity(account, tablename, partitionKey, rowKey, function(res){
			if (undefined != cb) cb(res.statusCode == HTTP_NO_CONTENT);
		});
	}
}

// TODO Merge Entiy




