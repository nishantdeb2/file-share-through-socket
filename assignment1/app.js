
const fs = require('fs');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
var files = {},
    struct = {
        name: null,
        type: null,
        size: 0,
        data: [],
        slice: 0,
    };
io.on('connection', function(socket){
socket.on('slice upload', (data) => {
  console.log("///,data",data)
    if (!files[data.name]) {
        files[data.name] = Object.assign({}, struct, data);
        files[data.name].data = [];
    }

    //convert the ArrayBuffer to Buffer
    data.data = new Buffer(new Uint8Array(data.data));
    //save the data
    files[data.name].data.push(data.data);
    files[data.name].slice++;

    if (files[data.name].slice * 100000 >= files[data.name].size) {
        //do something with the data
        socket.emit('end upload');
    } else {
        socket.emit('request slice upload', {
            currentSlice: files[data.name].slice
        });
    }
    if (files[data.name].slice * 100000 >= files[data.name].size) {
        var fileBuffer = Buffer.concat(files[data.name].data);
  console.log("1111111111111111",data.name)
        // fs.write(data.name, fileBuffer, (err) => {
        //     delete files[data.name];
        //     if (err) return socket.emit('upload error');
        //     socket.emit('end upload');
        // });
        fs.writeFile('./'+data.name,fileBuffer,function(err){
      //console.log("DONE");
      socket.emit('upload-completed')
    });
    }
});
})

// io.on('connection', function(socket){
//   socket.on('data-chunk', (data) => {
//     console.log("/...",data)
// });
// })


http.listen(3030, function(){
  console.log('listening on *:3030');
});
