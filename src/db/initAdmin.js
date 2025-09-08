import bcrypt from "bcrypt";

export const initAdminData = async (db) => {
    const userCount = await db.collection("users").countDocuments();

    if (userCount === 0) {
        console.log("🧩 Initializing admin user");

        const hashedPassword = await bcrypt.hash("password123", 10);

        const adminUser = await db.collection("users").insertOne({
            name: "Admin",
            email: "admin@gmail.com",
            phone: "+918811072239",
            password: hashedPassword,
            //! potential update; golden standard rbac,
            role: "admin",
            address: "Guwahati, Assam, India",
        });

        console.log("✅ Admin user initialized:", adminUser);
    }
}
