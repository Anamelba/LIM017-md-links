import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// *********** VERIFICA SI EXISTE LA RUTA true or false ***********
const existsPath = (route) => fs.existsSync (route);

// *********** CONVIERTA A UNA RUTA ABSOLUTA **********************
const pathIsAbsolute = (route) => path.isAbsolute(route) ? route : path.resolve(route);

// *********** EL PATH ES UN DIRECTORIO? **************************
const pathIsAdirectory = (route) => fs.lstatSync(route).isDirectory();

// *********** EL PATH ES UN ARCHIVO? *****************************
const pathIsAfile = (route) => fs.statSync(route).isFile();

// *********** IS IT A MD_FILE ? *****************************
const MDfile = (route) => path.extname(route) === '.md';

// *********** RECORRER EL DIRECTORIO RECURSIVAMENTE ***************
const travelByDirectoryAndFile = (route) => {
  let arrayResult = [];
  if(pathIsAdirectory(route)){ //si es un directorio vamos a bucar si dentro hay un archivo
    const arrayDirectory = fs.readdirSync(route); //lee sincrónicamente el contenido de un directorio
    arrayDirectory.forEach((file) => {
      const routeList = path.join(route, file); // routeList es un archivo encontrado dentro del directorio
      if(pathIsAdirectory(routeList)){ // si ya es un directorio con su archivos
        arrayResult = arrayResult.concat(travelByDirectoryAndFile(routeList))
      }
      if(path.extname(routeList) === '.md'){ // routeList Get the extension from a file path
        arrayResult.push(routeList);
      }
    })
  }
  else if (MDfile){
    arrayResult.push(route)
  } else {
    return 'ERROR: It is not a .md file';
  }
  return arrayResult;
}
// const arrayFile = travelByDirectoryAndFile(pathIsAbsolute('C:\\Users\\QA0005\\Desktop\\LAB\\LIM017-md-links\\testFiles\\prueba1.md'));

// *********** LEE UN DIRECTORIO Y OBTIENE LINKS *********** extractDirectoriesLinks
const readDirectory = (array_MDFiles) => {
  const arrayLinks = [];
  array_MDFiles.forEach(file => {
    const arrayLink = readMDFilesGetLinks(file);
    arrayLinks.push(arrayLink);
  })
  return arrayLinks.flat();
}

// *********** LEER UN ARCHIVO MD, SI TIENE LINKS ***********

const readMDFilesGetLinks = (route) => {
  const arrayLinks = [];
  const expRegFile = /\[(.*)\]\((https*?:([^"')\s]+))/gi;
  const expRegUrl = /(((https?:\/\/)|(http?:\/\/)|(www\.))[^\s\n)]+)(?=\))/gi;
  const expRegTextUrl = /\[(.*)\]/gi;

  const contentFile = fs.readFileSync(route, "UTF-8"); // read the file and return its content

  const MD_links = contentFile.match(expRegFile); // match encuentra coincidencias

  const array_url = contentFile.match(expRegUrl);

  if(MD_links != null) {
    for (let i = 0; i < MD_links.length; i++) {
      const textMD = MD_links[i].match(expRegTextUrl);
      const objLinks = {
        href: array_url[i],
        text: textMD,
        file: pathIsAbsolute(route).toString()
      }
      arrayLinks.push(objLinks);
    }
  }
  return arrayLinks;
}

// console.log('Estos son los links dentro de el archivo:', readMDFilesGetLinks('C:\\Users\\QA0005\\Desktop\\LAB\\LIM017-md-links\\testFiles\\prueba1.md'));

// *********** VALIDAR LINKS CON PETICIONES HTTP ***********

const validateLinks = (urls) => {
  return Promise.all(urls.map((arrayLinks) => {
    return fetch(arrayLinks.href)
      .then((resolve) => {
        const objResolve = {
          ...arrayLinks,
          status: resolve.status,
          ok: (resolve.status >= 200) && (resolve.status <= 399) ? "ok" : "fail"
        }
        return objResolve;
      })
      .catch(() => {
        return {
          ...arrayLinks,
          status: "This file is broken",
          ok: "Fail"
        }
      })
  })
  )
}
export default { existsPath, pathIsAbsolute, pathIsAdirectory, pathIsAfile, travelByDirectoryAndFile, readDirectory, readMDFilesGetLinks, validateLinks, MDfile }
