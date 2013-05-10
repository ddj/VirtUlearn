var assert = require('assert');
var azure = require('../lib/azure.js');

// Use this account for testing ..
var test_account = azure.devstore_account;
var wait = 1000;
/***********************************
* Core request functionality Tests *
***********************************/

function test_hmac_string () {
  
	var key = 'GuGbCQ41a9G1vtS1/dairlSMbXhHVzoA8+VPrbWxtj94o0aoAQdsgaaoYQASWqG9mj8xDvP1hSkvSVcLC34CfA==';

	var msg = "Hello World";
	var expected = '+UTfogPQ1ELBA4l+A7LwT1lbZVbP34F/CQzXaXqwfWA=';

	var actual = azure.hmac_string(key, msg);
	assert.equal(actual, expected, 'hmac_string test failed');
}

function test_canonicalized_resource_format_1 () {
	var account = {
		name: 'myaccount',
		key : 'x'
	}
	
	var request = {
		url: 'https://myaccount.blob.core.windows.net/mycontainer?restype=container&comp=metadata',
		method: 'GET',
		headers: {}
	}
	
	var actual = azure.canonicalized_resource_format_1(account.name, request);
	var expected = '/myaccount/mycontainer\nrestype:container\ncomp:metadata';
	assert.equal(actual,expected, 'canonicalized_resource-format_1 failed');
}

function test_canonicalized_headers () {
	var req = {
		url : "http://myaccount.blob.core.windows.net/?comp=list&restype=container",
		headers: {
			'x-ms-version' : '2009-09-19',
			'x-ms-date' : 'Sun, 12 Jun 2011 10:00:45 GMT'
		}
	}
	
	var actual = azure.canonicalized_headers(req);
	var expected =  "x-ms-date:Sun, 12 Jun 2011 10:00:45 GMT\nx-ms-version:2009-09-19\n";
	assert.equal(actual,expected, 'canonicalized_headers failed');
}

// Group
function run_core_tests() {
	test_hmac_string() ;
	test_canonicalized_resource_format_1();
	test_canonicalized_headers();
}

/*************************
* Blob Service API Tests *
*************************/

function test_list_containers() {
	azure.blob.list_containers(test_account, function(x) {
		assert.ok(x instanceof Array, 'test_list_containers failed.');
	});
}

function test_create_container() {
	var c = 'test-create-container';
	azure.blob.delete_container(test_account, c, function() {
		azure.blob.create_container(test_account, c, function(x) {
			assert.ok(x, 'test_create_container failed.');
			azure.blob.delete_container(test_account, c) // Clean up.
		});
	});
}

function test_delete_container() {
	var c = 'test-delete-container';
	azure.blob.create_container(test_account, c, function() {
		azure.blob.delete_container(test_account, c, function(x) {
			assert.ok(x, 'test_delete_container failed.');
		});
	});
}

function test_get_container_properties() {
	var c = 'test-get-container-properties';
	azure.blob.create_container(test_account, c, function() {
		azure.blob.get_container_properties(test_account, c, function(x) {
			assert.ok(x, 'test_get_container_properties failed.');
			azure.blob.delete_container(test_account, c); // Clean up.
		});
	});
}

function test_get_container_metadata() {
	var c = 'test-get-container-metadata';
	azure.blob.create_container(test_account, c, function() {
		azure.blob.get_container_metadata(test_account, c, function(x) {
			assert.ok(x, 'test_get_container_metadata failed.');
			azure.blob.delete_container(test_account, c); // Clean up.
		});
	});
}

function test_set_container_metadata() {
	var c = 'test-set-container-metadata';
	var expected = 'onetwothree';
	azure.blob.create_container(test_account, c, set_meta);
	
	function set_meta() {
		azure.blob.set_container_metadata(
		test_account, 
		c, 
		{'x-ms-meta-testing': expected},
		get_meta
		);
	}

	function get_meta() {
		azure.blob.get_container_metadata(test_account, c, function(x) {
			assert.ok(x, 'test_set_container_metadata failed. \
									Unable to get metadata.');
			assert.equal(
				x.headers['x-ms-meta-testing'],
				expected,
				'test_set_container_metadata failed. Expecting \'' + expected +
				'\', got \'' + x.headers['x-ms-meta-testing'] + '\''
			);
			azure.blob.delete_container(test_account, c); // Clean up.
		});
	}
}

function test_list_blobs() {
	var c = 'test-list-blobs';
	azure.blob.create_container(test_account, c, function() {
		azure.blob.list_blobs(test_account, c, function(x) {
			assert.ok(x, 'test_list_blobs failed.');
			azure.blob.delete_container(test_account, c); // Clean up.
		});
	});
}

function test_put_blob() {
	var c = 'test-put-blob';
	var b = 'test-put-blob';
	azure.blob.create_container(test_account, c, function() {
		azure.blob.put_blob(test_account, c, azure.blob.BlockBlob, b, 
							'Hello world!', {'Content-Type': 'text/plain'},
					   function(x) {
			assert.ok(x, 'test_put_blob failed. Status code: ' + x.statusCode);
			azure.blob.delete_container(test_account, c);
		});
	});
}

function test_get_blob() {
	var c = 'test-get-blob';
	var b = 'test-get-blob';
	azure.blob.create_container(test_account, c, function() {
		azure.blob.put_blob(test_account, c, azure.blob.BlockBlob, b, 
							'Hello world!', {'Content-Type': 'text/plain'},
					   function() { setTimeout(get_blob(), wait); });
	});
	
	function get_blob() {
		azure.blob.get_blob(test_account, c, b, function(x) {	
			assert.ok(x, 'test_get_blob failed. Blob could not be found within the specified wait time (' + wait + 'ms).');
			azure.blob.delete_container(test_account, c);
		});
	}
}

function test_delete_blob() {
	var c = 'test-delete-blob';
	var b = 'test-delete-blob';
	azure.blob.create_container(test_account, c, function() {
		azure.blob.put_blob(test_account, c, azure.blob.BlockBlob, b, 
							'Hello world!', {'Content-Type': 'text/plain'},
					   function() { setTimeout(del_blob(), wait); });
	});
	
	function del_blob() {
		azure.blob.delete_blob(test_account, c, b, function(x) {
			assert.ok(x, 'test_delete_blob failed. Blob could not be found within the specified wait time (' + wait + 'ms).');
			azure.blob.delete_container(test_account, c);
		});
	}
}

// Group
function run_blob_tests() {
	test_list_containers();
	test_create_container();
	test_delete_container();
	test_get_container_properties();
	test_get_container_metadata();
	test_set_container_metadata();
	test_list_blobs();
	test_put_blob();
	test_get_blob();
	test_delete_blob();
}

/**************************
* Queue Service API Tests *
**************************/

function test_list_queues() {
	azure.queues.list_queues(test_account, function(x) {
		assert.ok(x instanceof Array, 'test_list_queues did not return an array.');
	});
}

function test_create_queue() {
	var q = 'testcreate'
	// Must ensure container of this name doesn't already exists otherwise a 209
	// Conflict error is returned.
	azure.queues.delete_queue(test_account, q, function() {
		azure.queues.create_queue(test_account, q, function(x) {
			assert.ok(x, 'test_create_queue failed.');
			azure.queues.delete_queue(test_account, q); // Clean up.
		});
	});
}

function test_delete_queue() {
	var q = 'testdelete';
	azure.queues.create_queue(test_account, q, function() {
		azure.queues.delete_queue(test_account, q, function(x) {
			assert.ok(x, 'test_delete_queue failed.')
		});
	});
}

function test_put_get_queue() {

	var q = 'putgettest';
	azure.queues.create_queue(test_account, q, function(){
		setTimeout(function(){
			azure.queues.put_message(test_account, q, {Test:"Message"}, function(){
				setTimeout(function(){
					azure.queues.get_message(test_account, q, function(message){
						assert.ok(message.Data.Test == "Message", "test_get_message");
						azure.queues.delete_message(test_account, q, message, function(value){
							assert.ok(value, "test_delete_message");
							setTimeout(function(){
								azure.queues.get_message(test_account, q, function(msg){
									assert.ok(msg == undefined);
									azure.queues.delete_queue(test_account, q);
								});
							}, wait);
						});
					});
				}, wait);
			});
		} , wait);
	});

}

// Group
function run_queue_tests() {
	test_list_queues();
	test_create_queue();
	test_delete_queue();
	test_put_get_queue();
}

/**************************
* Table Service API Tests *
**************************/

function test_query_tables() {

	azure.tables.create_table(test_account, 'testquerytables', function(){
		setTimeout(function(){
			azure.tables.query_tables(test_account, function(tables) {
				var found = false;
				for ( var i=0, len=tables.length; i<len; ++i ){
					if (tables[i].TableName == 'testquerytables'){
						found = true;
					}
				}
				assert.ok(found, 'test_query_tables');
				azure.tables.delete_table(test_account, 'testquerytables', function(x){});
			});
		}, wait)
	});
}

function test_insert_entity() {
	azure.tables.create_table(test_account, 'testinserttable', function(y){
		setTimeout(function(){
			azure.tables.insert_entity(test_account, 'testinserttable', { RowKey:'123', PartitionKey: 'xyz', Value: 'foo' }, function(x) {
				setTimeout(function(){
					azure.tables.get_entity(test_account, 'testinserttable', 'xyz', '123', function(entity){
						assert.ok(entity.Value == 'foo', 'test_insert_entity');
						
						azure.tables.delete_table(test_account, 'testinserttable', function(x){});
					});
				}, wait);
			});
		}, wait);
	});
}


function test_query_entities() {

	azure.tables.create_table(test_account, 'testquerytable', function(){
		setTimeout(function(){
			azure.tables.insert_entity(test_account, 'testquerytable', { RowKey:'1', PartitionKey: 'xyz', Value: 'foo' }, function(x) {});
			azure.tables.insert_entity(test_account, 'testquerytable', { RowKey:'2', PartitionKey: 'xyz', Value: 'foo' }, function(x) {});
			azure.tables.insert_entity(test_account, 'testquerytable', { RowKey:'3', PartitionKey: 'xyz', Value: 'bar' }, function(x) {});
			azure.tables.insert_entity(test_account, 'testquerytable', { RowKey:'4', PartitionKey: 'xyz', Value: 'bar' }, function(x) {});
			azure.tables.insert_entity(test_account, 'testquerytable', { RowKey:'5', PartitionKey: 'xyz', Value: 'bar' }, function(x) {});
			azure.tables.insert_entity(test_account, 'testquerytable', { RowKey:'6', PartitionKey: 'xyz', Value: 'baz' }, function(x) {});

			setTimeout(function(){
				azure.tables.get_entity(test_account, 'testquerytable', 'xyz', '3', function(entity){
					assert.ok(entity != undefined, 'test_query_entities get_entity is undefined');
					assert.ok(entity.Value == 'bar', 'test_query_entities values is wrong');
				});
				
				azure.tables.get_entity(test_account, 'testquerytable', 'xyz', '7', function(entity){
					assert.ok(entity == undefined, 'test_query_entities get_entity is not undefined');
				});
				
				azure.tables.query_entities(test_account, 'testquerytable', "Value+eq+'foo'", function(entities){
					assert.ok(entities.length == 2, 'test_query_entities query_entities');
				});
				
				azure.tables.query_entities(test_account, 'testquerytable', "Value+eq+'qux'", function(entities){
					assert.ok(entities.length == 0, 'test_query_entities query_entities');
				});

				azure.tables.query_entities(test_account, 'testquerytable', "Value+eq+'baz'", function(entities){
					assert.ok(entities.length == 1, 'test_query_entities query_entities');
				});

				setTimeout(function(){
					// clear up
					azure.tables.delete_table(test_account, 'testquerytable', function(val){});
				}, wait * 2);
					
			}, wait);
		}, wait);
	});
	

}

function test_delete_entity() {


	azure.tables.create_table(test_account, 'deleteentitytable', function(){
		azure.tables.insert_entity(test_account, 'deleteentitytable', { RowKey:'1', PartitionKey: 'xyz', Value: 'foo' }, function(x) {
			setTimeout(function(){
				azure.tables.delete_entity(test_account, 'deleteentitytable', 'xyz', '1', function(){
					
					azure.tables.get_entity(test_account, 'deleteentitytable', 'xyz', '1', function(entity){
						assert.ok(entity == undefined, 'test_delete_entity get_entity is not undefined');
						
						azure.tables.delete_table(test_account, 'deleteentitytable', function(result){});
					});					
					
				});
			}, wait);
		});
	});

}

function test_delete_table(){

	azure.tables.create_table(test_account, 'deletetable', function(result){
		//assert.ok(result);
		setTimeout(function(){
			
			azure.tables.delete_table(test_account, 'deletetable', function(result){
				assert.ok(result, "test_delete_table");
			});
		
		},wait);
	});
}

function test_update_entity(){

	azure.tables.create_table(test_account, 'updatetable', function(result){
		setTimeout(function(){
			var obj = {PartitionKey: 'xyz', RowKey: 'updatekey', Value:'A'};
			azure.tables.insert_entity(test_account, 'updatetable', obj, function(){
				setTimeout(function(){
					obj.Value = 'B';
					azure.tables.update_entity(test_account, 'updatetable', obj, function(){
						setTimeout(function(){
							azure.tables.get_entity(test_account, 'updatetable', 'xyz', 'updatekey', function(entity){
								assert.ok(entity.Value == 'B', 'test_update_entity');
								azure.tables.delete_table(test_account, 'updatetable',  function(val){
									assert.ok(val);
								});
							});
						} ,wait);
					});
				}, wait);
			});
		}, wait);
	});

}

// Group
function run_table_tests() {
	test_query_tables();
	test_insert_entity();
	test_query_entities();
	test_delete_entity();
	test_delete_table();
	test_update_entity();
}

/******************************************************************************/

function run_all_tests() {
	run_core_tests();
	run_blob_tests();
	run_queue_tests();
	run_table_tests();
}

/******************************************************************************/


run_all_tests();
