import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {sourceArchive} from './source-archive.mjs';

const out='dist/entrega';
await fs.mkdir(out,{recursive:true});
await sourceArchive(out+'/oficina3d-fonte.zip',{includeSites:false});
await fs.copyFile('docs/TRANSFERENCIA-EMPRESA.md',out+'/TRANSFERENCIA-EMPRESA.md');
const bytes=await fs.readFile(out+'/oficina3d-fonte.zip');
await fs.writeFile(out+'/SHA256.txt',createHash('sha256').update(bytes).digest('hex')+'  oficina3d-fonte.zip\n');
console.log('Fonte e instruções de entrega em dist/entrega. Guarde-os em repositório privado da empresa.');
