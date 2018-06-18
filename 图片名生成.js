const fs = require("fs");
const path = require("path");

var imageName_h = "";
var existKeyName = {};
var image_map = new Map();

const images_source_path = path.resolve(process.argv[2]);
const export_imageh_path = path.resolve(process.argv[3]);
const assets_path = path.resolve(process.argv[4]);
const deleteAll = process.argv[5] === "1";

function ergodicDir(dir_path) {
  const files = fs.readdirSync(dir_path);

  files.forEach(function (file_name) {
    const file_path = path.normalize(dir_path + "/" + file_name);
    const stat = fs.statSync(file_path);

    if (stat.isFile()) {
      const file_name_arr = file_name.split("@");

      // console.log(file_name_arr);

      if (file_name_arr.length < 2) {
        return;
      }

      const image_name = file_name_arr[0];
      const image_key = `${image_name}.imageset`;

      var exist_obj_map = image_map.get(image_key);

      if (exist_obj_map) {
        exist_obj_map[file_name] = file_path;
      } else {
        const obj_map = new Map();
        obj_map[file_name] = file_path;
        image_map.set(image_key, obj_map);
      }

      const k_image_name = `kImageName_${image_name}`;

      if (existKeyName[k_image_name]) {
        return;
      }

      // console.log(image_name);

      const imageName_row = `static NSString *const ${k_image_name} = @"${image_name}";\n`;
      imageName_h += imageName_row;

      existKeyName[k_image_name] = 1;
    } else if (stat.isDirectory()) {
      ergodicDir(file_path);
    }
  });
}

ergodicDir(images_source_path);

function deleteAssetsDir() {
  const files = fs.readdirSync(assets_path);

  files.forEach(function (file_name) {
    const file_path = path.resolve(assets_path + "/" + file_name);
    const stat = fs.statSync(file_path);

    if (stat.isDirectory && file_name.includes(".imageset")) {
      deleteFolder(file_path);
    }
  });
}

if (deleteAll) {
  deleteAssetsDir();
}

function deleteFolder(path) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        deleteFolder(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

function getImageObj(scale, file_name) {
  const obj = {
    idiom: "universal",
    scale: scale
  };
  if (file_name.length > 0) {
    obj.filename = file_name;
  }
  return obj;
}

for (const [k, v] of image_map) {
  const image_dir = `${assets_path}/${k}`;

  const exist = fs.existsSync(image_dir);
  if (exist) {
    deleteFolder(image_dir);
  }

  fs.mkdirSync(image_dir);

  var json_code = {};

  json_code.images = [];

  json_code.images.push(getImageObj("1x", ""));
  for (const image_name in v) {
    const image_path = v[image_name];

    if (image_name.includes('@')===false) {
      continue;
    }

    const match_scale = image_name.match(/[@].+x/g);
    if (match_scale.length > 0) {
      const scale = match_scale[0].replace("@", "");
      json_code.images.push(getImageObj(scale, image_name));
    }

    var readStream = fs.createReadStream(image_path);
    var writeStream = fs.createWriteStream(`${image_dir}/${image_name}`);
    readStream.pipe(writeStream);
  }

  json_code.images.sort(function (a, b) {
    return a.idiom < b.idiom;
  })

  json_code.info = {
    version: 1,
    author: "xcode"
  };

  fs.writeFileSync(
    `${image_dir}/Contents.json`,
    JSON.stringify(json_code, null, 2)
  );
}

fs.writeFileSync(
  export_imageh_path,
  `
#import <Foundation/Foundation.h>

${imageName_h}
`
);
