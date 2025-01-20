const validateFile = (file, maxSize, allowedTypes)=>{
    if (file.size > maxSize){
        throw new Error("The file size is too big")
    }

    if(!allowedTypes.includes(file.mimetype)){
        throw new Error("Invalid file type")
    }

    return true; 
}

