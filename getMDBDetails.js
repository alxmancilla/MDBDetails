function getDBDetails() {  
  var db = this.db.getSiblingDB("admin");  
  var totalIndexSize = 0,
     totalStorageSize = 0,
     totalDataSize = 0,
     formatSize = 1024*1024;
 
  var dbInfo = [];

  var systemInfo = db.hostInfo();
  systemInfo.type = "hostInfo";
  dbInfo.push(systemInfo);

  var serverInfo = db.serverStatus();
  serverInfo.type = "serverInfo";
  dbInfo.push(serverInfo);

  var isReplSet = db.serverStatus().repl;

  if( isReplSet != null ) {
    var clusterType = rs.status();
    clusterType.type = "replSetInfo";
    dbInfo.push(clusterType);
  }


  var isSharded = db.serverStatus().sharding;

  if( isSharded != null ) {
    var clusterType = sh.status();
    clusterType.type = "shardedInfo";
    dbInfo.push(clusterType);
  }



  var dbs = db.runCommand({ listDatabases: 1 }).databases;  

  dbs.forEach(function(database) { 
    if (['local','admin', 'metadata', 'config'].indexOf(database.name) != -1) {
	 return; 
    }
    db = db.getSiblingDB(database.name);
    dbStats = db.stats(formatSize);
    dbStats.type = "database";
    //print("database: " + database.name);

    dbInfo.push(dbStats);

 
    var collections = db.getSiblingDB(database.name).getCollectionNames();
    if (collections) {
        collections.forEach(function(col) {
            tempCol = db.getSiblingDB(database.name).getCollection(col);
            if(tempCol.exists().type == "collection") {
                colStats = tempCol.stats(formatSize);
                colStats.type = "collection";
            //print("collection: " + tempCol );
                dbInfo.push(colStats);
            } 
            else {
                dbInfo.push( tempCol.exists() );
            }
        })
    }

  });

  print(JSON.stringify(dbInfo));
}

getDBDetails();


