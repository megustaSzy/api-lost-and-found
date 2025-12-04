import prisma from "../lib/prisma";


export const countService = {
    async getCount () {
        const lost = await prisma.tb_lostReport.count();
        const found = await prisma.tb_foundReports.count();
        const user = await prisma.tb_user.count();

        return {
            lost,
            found,
            user
        }
    }
}