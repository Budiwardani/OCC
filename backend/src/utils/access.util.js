export const complaintScope = (user, alias = "c", startIndex = 1) => {
    const clauses = [];
    const params = [];
    let parameterIndex = startIndex;

    if (user.role !== "Superadmin") {
        if (!user.company_id) {
            clauses.push("1 = 0");
        } else {
            clauses.push(`${alias}.company_id = $${parameterIndex}`);
            params.push(user.company_id);
            parameterIndex += 1;
        }

        if (user.role === "Agent") {
            clauses.push(`${alias}.assigned_to = $${parameterIndex}`);
            params.push(user.id);
        }
    }

    return {
        sql: clauses.length ? ` AND ${clauses.join(" AND ")}` : "",
        params,
    };
};

export const isCompanyRole = (role) => ["Superadmin", "Admin", "Manager"].includes(role);
