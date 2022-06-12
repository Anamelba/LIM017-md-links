import  opeApi from './operacionesApi.js';

const api_MDlinks = (path, validateOptions) => { //optionValidate
  return new Promise((resolve, reject) => {
    const existsPath = opeApi.existsPath(path);
    if (existsPath === false) {
      reject("The path is invalid :( ");
    }
    else{
      const absolutePath = opeApi.pathIsAbsolute(path);
      if(opeApi.MDfile(absolutePath)||opeApi.pathIsAdirectory(absolutePath)){
        const filterDirectoryByMdFile = opeApi.travelByDirectoryAndFile(absolutePath);
        if (filterDirectoryByMdFile.length === 0){
          reject('No links here');
        } else {
        const extractDirectoryLinks = opeApi.readDirectory(filterDirectoryByMdFile);
        if (extractDirectoryLinks.length === 0) {
            reject('No se encuentra links');
          } else if (validateOptions.validate) {
            resolve(opeApi.validateLinks(extractDirectoryLinks));
          } else {
            resolve(extractDirectoryLinks);
          }
        }
      } else {
        reject('It isent a directory or md. file');
      }
    }
  });
}
// console.log(api_MDlinks('C:\\Users\\QA0005\\Desktop\\LAB\\LIM017-md-links\\testFiles\\prueba1.md'));

export default { api_MDlinks }
