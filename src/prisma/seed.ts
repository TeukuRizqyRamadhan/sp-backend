import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const hashedAdminPassword = await bcrypt.hash("112233aa", 10);

    // Tambah Admin
    await prisma.admin.create({
        data: {
            email: "admin",
            password: hashedAdminPassword,
        },
    });

    // Tambah Siswa
    await prisma.siswa.create({
        data: {
            nama: "Budi Santoso",
            spCount: 0,
            kelas: "7A",
        },
    });

    console.log("Admin dan Siswa berhasil ditambahkan!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
