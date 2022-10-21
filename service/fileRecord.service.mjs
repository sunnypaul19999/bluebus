// import { queryFileRecord, queryAllFileRecordOfUser, persistFileRecord } from '../model/fileRecord.model.mjs';

// async function addFileRecord(userId, fileStorageName, fileName, fileSize, fileType, filePath) {
//     try {
//         return await persistFileRecord(userId, fileStorageName, fileName, fileSize, fileType, filePath);
//     } catch (err) {
//         console.error(err, 'failed to persist file record');
//     }
// }

// async function getFileRecord(userId, fileRecordId) {
//     try {
//         return await queryFileRecord(userId, fileRecordId);
//     } catch (err) {
//         console.error(err, 'failed to get file record from persistent storage');
//     }
// }

// async function getUserFileRecords(userId) {
//     try {
//         return await queryAllFileRecordOfUser(userId);
//     } catch (err) {
//         console.error(err, 'failed to persist file record');
//     }
// }

// export { getFileRecord, getUserFileRecords, addFileRecord };
