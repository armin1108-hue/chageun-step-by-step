import {readFile,readdir} from 'node:fs/promises';
import vm from 'node:vm';
for(const name of await readdir('web')){
  if(name.endsWith('.js'))new vm.Script(await readFile(`web/${name}`,'utf8'),{filename:name});
  if(name.endsWith('.html')){
    const html=await readFile(`web/${name}`,'utf8');let i=0;
    for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
      if(!/\bsrc=/.test(match[1]))new vm.Script(match[2],{filename:`${name}:inline-${++i}`});
    }
  }
}
console.log('All web scripts passed syntax checks.');
