var thrift = require('thrift'),
    HBase = require('./db/Hbase.js'),
    HBaseTypes = require('./db/Hbase_types.js'),
    connection = thrift.createConnection('1.2.3.4', 9090, {
		transport: thrift.TFramedTransport,
		protocol: thrift.TBinaryProtocol,
		timeout: 10000
	});
	
var client = thrift.createClient(HBase,connection);

/** TEMPORARY PATCH FROM THRIFT1 -> THRIFT2 **/


client.getRowWithColumns = function(tableName, rowKey, columns, attributes, callback){
			
	columns.forEach(function(col, index){
				
		col = col.split(':');
		
		var family = col.splice(0,1).toString();
		
		columns[index] = new HBaseTypes.TColumn({family: family, qualifier: col.join(':') || null})
		
	})
		
	var tGet = new HBaseTypes.TGet({row: rowKey, columns: columns});
		
	client.get(tableName, tGet, function (err, data) {

		data.columns = {};
		
		if(data.columnValues){
		
			data.columnValues.forEach(function(dataObj, index){
				
				dataObj.key = dataObj.family+":"+dataObj.qualifier;
				data.columns[dataObj.key] = dataObj;
				
			})
			
		}
		
		data = [data];
			
		callback(err, data);
	});
	
}

//client.incrementRows

client.deleteAllRow = function(tableName, rowKey, attributes, callback){
		
	client.mutateRow(tableName, new HBaseTypes.TRowMutations({row: rowKey, mutations: [new HBaseTypes.TMutation({
			deleteSingle: new HBaseTypes.TDelete({row: rowKey, columns: null})
		})]}), callback);
	
}

client.mutateRowDeprecated = function(tableName, rowKey, mutationObj, attributes, callback){

	var deletes = [];
	var puts = [];
	
	mutationObj.forEach(function(mutation){
		
		var col = mutation.column.split(':');
		var family = col.splice(0,1).toString();
		
		if(mutation.isDelete){
			
			deletes.push(new HBaseTypes.TColumn({family: family, qualifier: col.join(':') || null}));
			
		}else{
			
			puts.push(new HBaseTypes.TColumnValue({family: family, qualifier: col.join(':') || null, value: mutation.value}));			
			
		}
		
	})
	
    var rowMutations = [];
	
	if(deletes.length>0){
		rowMutations.push(new HBaseTypes.TMutation({
			deleteSingle: new HBaseTypes.TDelete({row: rowKey, columns: deletes})
		}));
	}
	
	if(puts.length>0){
		rowMutations.push(new HBaseTypes.TMutation({
			put: new HBaseTypes.TPut({row: rowKey, columnValues: puts})
		}));
	}
	
	rowMutations = new HBaseTypes.TRowMutations({row: rowKey, mutations: rowMutations});
				
	this.seqid += 1;
	this._reqs[this.seqid] = callback;
	this.send_mutateRow(tableName, rowMutations);
};

client.scannerOpenWithPrefix = function(tableName, rowPrefix, columns, attributes, callback){
	
	columns.forEach(function(column, index){
		
		var col = column.split(':');
		var family = col.splice(0,1).toString();
		
		columns[index] = new HBaseTypes.TColumn({family: family, qualifier: col.join(':') || null})
		
	})
		
	var scan = new HBaseTypes.TScan({startRow: null, stopRow: null, columns: columns, caching: 0, maxVersions: 1, timeRange: null, filterString: "(PrefixFilter ('"+rowPrefix+":')", batchSize: null, attributes: attributes});
			
	client.openScanner(tableName, scan, callback);
	
}

client.scannerClose = function(scannerId, callback){
	
	client.closeScanner(scannerId, callback);
	
}

client.scannerOpenWithScan = function(tableName, scan, attributes, callback){
	
	if(scan && scan.columns){
	
		scan.columns.forEach(function(column, index){
		
			var col = column.split(':');
			var family = col.splice(0,1).toString();
			
			scan.columns[index] = new HBaseTypes.TColumn({family: family, qualifier: col.join(':') || null})
			
		})
		
		
	}
	
	var scan = new HBaseTypes.TScan({startRow: scan.startRow || null, stopRow: scan.stopRow || null, columns: scan.columns, caching: parseInt(scan.caching) || 0, maxVersions: scan.maxVersions || 1, timeRange: scan.timeRange || null, filterString: scan.filterString || null, batchSize: null, attributes: scan.attributes || null});
		
	client.openScanner(tableName, scan, callback);
	
}

client.scannerGetList = function(scannerId, numRows, callback){
	
	client.getScannerRows(scannerId, numRows, function(err, data){
	
		if(typeof data == 'object'){
			
			data.forEach(function(d, i){
				
				data[i].columns = {};
			
				if(data[i].columnValues){
				
					data[i].columnValues.forEach(function(dataObj, index){
						
						dataObj.key = dataObj.family+":"+dataObj.qualifier;
						data[i].columns[dataObj.key] = dataObj;
						
					})
				
				}
				
			})
			
			
			
			
		}	
		
		callback(err, data);
		
	});
	
	
}


HBaseTypes.Mutation = function(obj){
	
	return obj;
	
}


/** END TEMP PATCH **/

exports.db = client;
exports.HBaseTypes = HBaseTypes;


connection.on('connect', function () {
	console.log('hbase thrift connected');
	 
})

connection.on('error', function(err) {
	console.log('hbase connection error');
	console.error(err);
	connection.end();
	client = thrift.createClient(HBase,connection);
	exports.db = client;
	
	var touch = require("touch");
	touch('./db.js');

});
