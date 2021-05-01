
const fs = require('fs');
const path = require('path');

const appJson = require('../config/app_config.json');

const db = require('../models/db');
const FileModal = db.file;
const UserModal = db.user;

module.exports = {
    fetchAllAssetsResources: async (req, res) => {
        console.log("--:: POST Request :: for :: featch all fetch All Assets Resources method ::--");
        var input = req.body
        if (input.userId == undefined ||input.userId == "") {
            return res.status(300).json({status: 300, message: 'userId is required' });
        }

        var filterQuery = { isDeleted:false,_user: input.userId };

        //chec for specify the conditions - fileType
        if(input.fileType!==undefined && input.fileType!==""&& appJson.file_type.includes(input.fileType.toUpperCase())){
            filterQuery.fileType = input.fileType.toUpperCase();
        }

        //chec for specify the conditions - fileExtension
        if(input.fileExtension!==undefined && input.fileExtension!=="" && appJson.file_extension.includes(input.fileExtension.toUpperCase())){
            filterQuery.fileExtension = input.fileExtension.toUpperCase();
        }
        console.log(":: filterQuery ::",filterQuery);

        var fileData = await FileModal.find(filterQuery);
        return res.send({ status: 200, data: fileData });

    },
    uploadAssetsResources: (req, res,next) => {
        console.log("--:: POST Request :: for :: upload AssetsResources method ::--");
        let file = req.files[0];
        console.log('\n',file);
        let path = file.destination.replace('./storage','/static');
        var params = {
            fileName: req.headers.file_name,
            fileSize: file.size,
            fileMimeType: file.mimetype,
            _user: req.headers.user_id,
            storagePath: path
        };
    
        if(req.headers.request_type =="ASSETS_RESOURCES" && req.headers.file_type == "IMAGE"){
            var temp = file.mimetype.split('/');
            params.fileType = temp[0].toUpperCase();
            params.fileExtension = temp[1].toUpperCase()
        }else if(req.headers.request_type =="ASSETS_RESOURCES" && req.headers.file_type=="JS"){
            params.fileType = 'JS';
            params.fileExtension = 'JS';
        }else if(req.headers.request_type =="ASSETS_RESOURCES" && req.headers.file_type=="CSS" ){
            params.fileType = 'CSS';
            params.fileExtension = 'CSS';
        }

        console.log(":: before save params ::", params);
        FileModal.create(params).then(_file=> {
            res.status(200).json({ status: 200, message: 'File has been uploaded successfully!', file: _file});
        }).catch((err) => {
            console.log('catch erro',err);
            res.status(300).json({ status: 300, message: 'Something went wrong', error: err});
        });
    },
    checkFileName: async (req, res) => {
        console.log("--:: POST Request :: for :: check File Name available method ::--");
        var input = req.body;
        console.log('/n',input);
        if (input.fileName == undefined || input.fileName == "") {
            return res.status(300).json({status: 300, message: 'fileName is required' });
        } else if (input.fileType == undefined || input.fileType == "") {
            return res.status(300).json({status: 300, message: 'fileType is required' });
        }

        var file = await FileModal.findOne({
            isDeleted: false,
            fileName: input.fileName,
            fileType: input.fileType
        });

        if(file){
            return res.status(300).json({status: 300, message: 'file name already taken.' });
        }else{
            return res.status(200).json({status: 200, message: 'File name is available.' });
        }
    },
    renameFileName: async (req, res) => {
        console.log("--:: POST Request :: for :: rename file name available method ::--");
        var input = req.body;
        console.log('/n',input);
        if (input.newFileName == undefined || input.newFileName == "") {
            return res.status(300).json({status: 300, message: 'fileName is required' });
        } else if (input.userId == undefined || input.userId == "") {
            return res.status(300).json({status: 300, message: 'userId is required' });
        }else if (input.fileType == undefined || input.fileType == "") {
            return res.status(300).json({status: 300, message: 'fileType is required' });
        }

        var file = await FileModal.findOne({
            isDeleted: false,
            fileName: input.newFileName,
            fileType: input.fileType
        });
        if(file == null) return res.status(300).json({status: 300, message: "file not found can't rename file." });

        if(file){
            return res.status(300).json({status: 300, message: 'file name already taken.' });
        }else{
            var fileData = await FileModal.updateOne({_id: file.id},{fileName: input.newFileName,_updateByUser:input.userId});
            return res.status(200).json({status: 200, message: 'File name is available.',data:fileData });
        }
    },
    getFileContent:async (req, res) => {
        console.log("--:: POST Request :: for :: get File Content method ::--");
        var fileId = req.param('id');
        console.log('/n',fileId);

        if (fileId == undefined || fileId == "") {
            return res.status(300).json({status: 300, message: 'fileId is required' });
        }

        var file = await FileModal.findOne({_id:fileId,isDeleted:false});

        if (!file) return res.status(400).json({status: 400, message: 'file not found.' });

        var file_path = file.storagePath.replace('/static','');
        var file_name = file.fileName+'.'+file.fileExtension.toLowerCase();
        try {

            var appDir = path.dirname(require.main.filename);
            var filepath = `${appDir}/storage${file_path}/${file_name}`;

            console.log(":: FILE PATH ::",filepath);
            var data = fs.readFileSync(filepath, 'utf8');
            console.log("::: read content :::>\n",data);

            return res.status(200).json({status: 200, message: 'success, get the content of file.',data:data});
        } catch (err) {
            console.error(err);
            return res.status(300).json({status: 300, message: 'Something went wrong.',error:err});
        }
    },
    updateFileContent:async (req, res) => {
        console.log("--:: POST Request :: for :: update file content method ::--");
        var input = req.body;
        console.log('/n',input);
        if (input.fileId == undefined || input.fileId == "") {
            return res.status(300).json({status: 300, message: 'fileId is required' });
        } else if (input.content == undefined || input.content == "") {
            return res.status(300).json({status: 300, message: "file content can't be blank." });
        }else if (input.userId == undefined || input.userId == "") {
            return res.status(300).json({status: 300, message: "userId is required." });
        }

        var file = await FileModal.findOne({_id: input.fileId, isDeleted:false});
        if (!file) return res.status(400).json({status: 400, message: 'file not found.' });

        var file_path = file.storagePath.replace('/static','');
        var file_name = file.fileName+'.'+file.fileExtension.toLowerCase();

        try {
            var appDir = path.dirname(require.main.filename);
            // var appDir = process.cwd();
            var filepath = `${appDir}/storage${file_path}/${file_name}`;
            console.log(":: File path ::",filepath);

            const data = fs.writeFileSync(filepath, input.content);
            console.log("::: write content :::>",data);
       
            var fileData = await FileModal.updateOne({_id: file.id},{_updateByUser:input.userId});
            console.log("fileData::",fileData);

            return res.status(200).json({status: 200, message: 'file update successfully.' ,data:fileData});

        } catch (err) {
            console.error(err);
            return res.status(300).json({status: 300, message: 'Something went wrong.',error:err});
        }

    },
    deteleFile:async (req, res) => {
        console.log("--:: POST Request :: for :: detele File method ::--");
        var input = req.body;
        console.log('/n',input);
        if (input.fileId == undefined || input.fileId == "") {
            return res.status(300).json({status: 300, message: 'fileId is required' });
        }else if (input.userId == undefined || input.userId == "") {
            return res.status(300).json({status: 300, message: 'userId is required' });
        }

        var file = await FileModal.findOne({_id: input.fileId, isDeleted:false});
        if (!file) return res.status(400).json({status: 400, message: 'file not found.' });

        var file_path = file.storagePath.replace('/static','');
        var file_name = file.fileName+'.'+file.fileExtension.toLowerCase();

        var appDir = path.dirname(require.main.filename);
        var currentPath = `${appDir}/storage${file_path}/${file_name}`;

        var  archived_path ;
        if(file.fileType == "CSS"){
            archived_path = appJson.archived_path.css;
        }else if( file.fileType == "JS"){
            archived_path = appJson.archived_path.js;
        }else{
            archived_path = appJson.archived_path.image;
        }
        
        var newPath = `${appDir}/storage${archived_path}/${file_name}`;
         console.log(':: currentPath  :: ',currentPath);
         console.log(':: newPath :: ',newPath);

        try {
           fs.renameSync(currentPath, newPath);
           console.log("Successfully moved the file!")
           var fileData = await FileModal.updateOne({_id: file.id},{isDeleted:true,_updateByUser:input.userId});
           console.log("fileData::",fileData);
           return res.status(200).json({status: 200, message: "Successfully moved the file!" ,data:fileData});
        } catch(err) {
            console.error(err);
            return res.status(300).json({status: 300, message: 'Something went wrong.',error:err});
        }

    },
    sample:async (req, res) => {
        console.log("--:: POST Request :: for :: check File Name available method ::--");
        var input = req.body;
        console.log('/n',input);
        if (input.fileName == undefined || input.fileName == "") {
            return res.status(300).json({status: 300, message: 'fileName is required' });
        } else if (input.fileType == undefined || input.fileType == "") {
            return res.status(300).json({status: 300, message: 'fileType is required' });
        }
    }
}
