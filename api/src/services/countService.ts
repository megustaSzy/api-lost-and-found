import prisma from "../lib/prisma"


export const countService = {

    async getAdminDashboardCount() {
        const [lost, found, user] = await Promise.all([
            prisma.tb_lostReport.count(),
            prisma.tb_foundReports.count(),
            prisma.tb_user.count(),
        ]);

        return {
            lost,
            found,
            user
        }
    },

    async getUserDashboardCount(userId: number) {
        const [myLost, found] = await Promise.all([
            prisma.tb_lostReport.count({
                where: {
                    userId
                }
            }),
            prisma.tb_foundReports.count(),
        ])

        return {
            myLost,
            found
        }
    }

}