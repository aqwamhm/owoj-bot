const AuthorizationError = require("../exceptions/AuthorizationError");
const adminServices = require("../services/admin");

const verifyMessageFromAdmin = async (message, client) => {
  const isGroup = message.key.remoteJid?.endsWith("@g.us");

  let senderJid;
  if (isGroup) {
    senderJid =
      message.key.participant ||
      message.key.participantPn ||
      message.participant;
  } else {
    senderJid = message.key.remoteJid;
  }

  if (!senderJid) {
    throw new AuthorizationError(
      `Tidak dapat menjalankan command ini. Identitas pengirim tidak ditemukan.`,
    );
  }

  // Context 1: WhatsApp Group Admin (Bypass LID issue)
  if (isGroup && client) {
    try {
      const metadata = await client.groupMetadata(message.key.remoteJid);
      const participant = metadata.participants.find((p) => p.id === senderJid);

      if (
        participant &&
        (participant.admin === "admin" || participant.admin === "superadmin")
      ) {
        return {
          admin: {
            name: "WhatsApp Admin",
            phoneNumber: senderJid.split("@")[0],
          },
        };
      }
    } catch (error) {
      console.error(
        `Failed to fetch group metadata for admin check:`,
        error.message,
      );
    }
  }

  // Context 2: Database Admin (For PM or non-group-admin users)
  const phoneNumber = senderJid.split("@")[0];
  const admin = await adminServices.find({ phoneNumber });

  if (!admin) {
    console.error(`Unauthorized access attempt by ${phoneNumber}`);
    throw new AuthorizationError(
      `Tidak dapat menjalankan command ini. Nomor anda tidak terdaftar sebagai admin.`,
    );
  }

  return { admin };
};

module.exports = verifyMessageFromAdmin;
