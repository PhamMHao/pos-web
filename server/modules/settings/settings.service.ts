import prisma from "../../config/db";

export class SettingsService {
  static async getSettings() {
    const records = await prisma.storeSettings.findMany({
      where: { id: "default_settings" },
    });

    if (records.length === 0) {
      return null;
    }

    const rec = records[0];
    let parsedJson: any = {};
    if (rec.settingsJson) {
      try {
        parsedJson = JSON.parse(rec.settingsJson);
      } catch {}
    }

    return {
      storeName: rec.storeName,
      tagline: rec.tagline,
      phone: rec.phone,
      email: rec.email,
      address: rec.address,
      taxCode: rec.taxCode,
      bankName: rec.bankName,
      bankAccount: rec.bankAccount,
      bankCode: rec.bankCode,
      ...parsedJson,
      updatedAt: rec.updatedAt,
    };
  }

  static async updateSettings(data: any) {
    const {
      storeName = "Gia Phúc Computer",
      tagline = "",
      phone = "",
      email = "",
      address = "",
      taxCode = "",
      bankName = "",
      bankAccount = "",
      bankCode = "",
      ...rest
    } = data;

    const settingsJson = JSON.stringify(data);

    const existing = await prisma.storeSettings.findMany({
      where: { id: "default_settings" },
    });

    if (existing.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO [StoreSettings] (id, storeName, tagline, phone, email, address, taxCode, bankName, bankAccount, bankCode, settingsJson, updatedAt)
        VALUES ('default_settings', ${storeName}, ${tagline}, ${phone}, ${email}, ${address}, ${taxCode}, ${bankName}, ${bankAccount}, ${bankCode}, ${settingsJson}, GETDATE())
      `;
    } else {
      await prisma.storeSettings.updateMany({
        where: { id: "default_settings" },
        data: {
          storeName,
          tagline,
          phone,
          email,
          address,
          taxCode,
          bankName,
          bankAccount,
          bankCode,
          settingsJson,
        },
      });
    }

    return this.getSettings();
  }
}
