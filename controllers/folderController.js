const Folder = require('../model/Folder');
const Document = require('../model/Document');
const User = require('../model/User');

const uploadDoc = async (req, res) => {
    const { folderName, docLink, docName, userEmail } = req.body;

    try {
        const folder = await Folder.findOne({ name: folderName });
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }        
        const newDocument = new Document({
            name: docName,
            parentFolder: folder._id,
            avgRating: 0,  
            uploadedBy: user._id,
            rscLink: docLink
        });
        const savedDocument = await newDocument.save();
       
        folder.contents.push(savedDocument._id);
        await folder.save();
        user.uploadedDocs.push(savedDocument._id);
        user.totalUploaded += 1;
        await user.save();
        
        res.status(201).json(savedDocument);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const createFolder = async (req, res) => {
    const { name, parentFolderName } = req.body;
    let exists = await Folder.find({name});
    let id = await Folder.findOne({name: parentFolderName});
    console.log(id);
    exists = exists.filter((folder)=>{
        folder.parentFolder == parentFolderName
    });
    if(exists.length!=0){
        return res.status(409).json({message: "Folder already exists"});
    }else{
        try {
            let parentFolder = null;
            if (parentFolderName) {
                parentFolder = await Folder.findOne({ name: parentFolderName });
    
                if (!parentFolder) {
                    return res.status(404).json({ message: 'Parent folder not found' });
                }
            }
            const newFolder = new Folder({
                name: name,
                parentFolder: parentFolder ? parentFolder._id : null,
                subfolders: [],
                contents: []
            });
            const savedFolder = await newFolder.save();
            if (parentFolder) {
                parentFolder.subfolders.push(savedFolder._id);
                await parentFolder.save();
            }
            res.status(201).json(savedFolder);
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

const renameFolder = async (req, res) => {
    const { folderId, newName } = req.body;

    try {
        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }
        
        const parentFolder = await Folder.findById(folder.parentFolder);
        if (parentFolder && parentFolder.subfolders.some(subfolderId => subfolderId.toString() !== folderId && subfolderId.name === newName)) {
            return res.status(400).json({ message: 'Folder with the same name already exists' });
        }

        folder.name = newName; 
        const updatedFolder = await folder.save(); 

        res.status(200).json(updatedFolder);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getDocs = async (req, res) => {
    const { folderId } = req.params;
    try {
        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }
        const collectDocuments = async (folder) => {
            let documents = [];
            documents = documents.concat(await Document.find({ parentFolder: folder._id }));
            for (const subfolderId of folder.subfolders) {
                const subfolder = await Folder.findById(subfolderId);
                if (subfolder) {
                    documents = documents.concat(await collectDocuments(subfolder));
                }
            }
            return documents;
        };
        const documents = await collectDocuments(folder);
        res.status(200).json(documents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const deleteFolder = async (req, res) => {
    const { folderId } = req.body;

    try {
        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }
        if (folder.subfolders.length > 0 || folder.contents.length > 0) {
            return res.status(400).json({ message: 'Folder is not empty' });
        }
        if (folder.parentFolder) {
            const parentFolder = await Folder.findById(folder.parentFolder);
            parentFolder.subfolders = parentFolder.subfolders.filter(subfolderId => subfolderId.toString() !== folderId);
            await parentFolder.save();
        }
        await Folder.findByIdAndDelete(folderId);

        res.status(200).json({ message: 'Folder deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getFolderById = async (req, res) => {
    const { folderId } = req.body;

    try {
        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }
        res.status(200).json(folder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getSubfolders = async (req, res) => {
    const { folderId } = req.body;

    try {
        const folder = await Folder.findById(folderId).populate('subfolders');
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }
        res.status(200).json(folder.subfolders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateFolder = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedFolder = await Folder.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedFolder) {
            return res.status(404).json({ message: 'Folder not found' });
        }
        res.status(200).json(updatedFolder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = { uploadDoc, createFolder, renameFolder, deleteFolder, getDocs, getFolderById, getSubfolders, updateFolder };
