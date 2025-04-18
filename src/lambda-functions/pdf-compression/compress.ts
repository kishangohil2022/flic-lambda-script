import path from 'path';
import util from 'util';
import fs from 'fs';
import os from 'os';
import childProcess from 'child_process';
import _ from 'lodash';

const PDF_COMPRESSION_MINIMUM_SIZE = process.env.PDF_COMPRESSION_MINIMUM_SIZE
    ? Number(process.env.PDF_COMPRESSION_MINIMUM_SIZE)
    : 8380000;
const exec = util.promisify(childProcess.exec);

const defaultOptions = {
    compatibilityLevel: 1.4,
    resolution: 'ebook',
    imageQuality: 100,
    gsModule: '/opt/bin/gs',
    pdfPassword: '',
    removePasswordAfterCompression: false,
};

async function compress(file: Buffer, options: object) {
    const { resolution, imageQuality, compatibilityLevel, gsModule, pdfPassword, removePasswordAfterCompression } =
        _.defaults(options, defaultOptions);

    const output = path.resolve(os.tmpdir(), Date.now().toString());

    let command;
    let tempFile;

    await exec(`${gsModule} --version`);
    if (typeof file === 'string') {
        command = `${gsModule} -q -dNOPAUSE -dBATCH -dSAFER -dSimulateOverprint=true -sDEVICE=pdfwrite -dCompatibilityLevel=${compatibilityLevel} -dPDFSETTINGS=/${resolution} -dEmbedAllFonts=true -dSubsetFonts=true -dAutoRotatePages=/None -dColorImageDownsampleType=/Bicubic -dColorImageResolution=${imageQuality} -dGrayImageDownsampleType=/Bicubic -dGrayImageResolution=${imageQuality} -dMonoImageDownsampleType=/Bicubic -dMonoImageResolution=${imageQuality} -sOutputFile=${output}`;

        if (pdfPassword) {
            command = command.concat(` -sPDFPassword=${pdfPassword}`);
        }

        if (!removePasswordAfterCompression) {
            command = command.concat(` -sOwnerPassword=${pdfPassword} -sUserPassword=${pdfPassword}`);
        }

        command = command.concat(` ${file}`);
    } else {
        tempFile = path.resolve(os.tmpdir(), (Date.now() * 2).toString());

        await fs.promises.writeFile(tempFile, file);

        command = `${gsModule} -q -dNOPAUSE -dBATCH -dSAFER -dSimulateOverprint=true -sDEVICE=pdfwrite -dCompatibilityLevel=${compatibilityLevel} -dPDFSETTINGS=/${resolution} -dEmbedAllFonts=true -dSubsetFonts=true -dAutoRotatePages=/None -dColorImageDownsampleType=/Bicubic -dColorImageResolution=${imageQuality} -dGrayImageDownsampleType=/Bicubic -dGrayImageResolution=${imageQuality} -dMonoImageDownsampleType=/Bicubic -dMonoImageResolution=${imageQuality} -sOutputFile=${output}`;

        if (pdfPassword) {
            command = command.concat(` -sPDFPassword=${pdfPassword}`);
        }

        if (!removePasswordAfterCompression) {
            command = command.concat(` -sOwnerPassword=${pdfPassword} -sUserPassword=${pdfPassword}`);
        }

        command = command.concat(` ${tempFile}`);
    }

    await exec(command);

    if (tempFile) await fs.unlinkSync(tempFile);

    const readFile = await fs.promises.readFile(output);

    await fs.unlinkSync(output);

    return readFile;
}

async function compressPdf(data: Buffer) {
    const compressedPdfBuffer = await compress(data, {
        // imageQuality: 85,
        resolution: 'default',
    });

    if (Buffer.byteLength(compressedPdfBuffer) > PDF_COMPRESSION_MINIMUM_SIZE) {
        console.log(
            '[compressPdf] Applying aggressive compression',
            Buffer.byteLength(compressedPdfBuffer) / 1024 / 1024,
        );
        const aggressiveCompressedPdfBuffer = await compress(data, {
            imageQuality: 70,
            resolution: 'ebook',
        });
        return aggressiveCompressedPdfBuffer;
    }
    return compressedPdfBuffer;
}

export default compressPdf;
