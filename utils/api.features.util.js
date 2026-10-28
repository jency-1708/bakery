class ApiFeatures {
    constructor(model, queryParams) {
        this.model = model;
        this.queryParams = queryParams;
        this.query = model.find();
    }

    // WHERE CLAUSE
    whereClause(extraWhere = {}) {
        this.query = this.query.find(extraWhere);

        return this;
    }

    // SELECT FIELDS
    selectFields(fields = []) {
        if (Array.isArray(fields) && fields.length > 0) {
            this.query = this.query.select(fields.join(" "));
        }

        return this;
    }

    // EXCLUDE FIELDS
    excludeFields(fields = []) {
        if (Array.isArray(fields) && fields.length > 0) {
            const excludeFields = fields.map((field) => `-${field}`);

            this.query = this.query.select(excludeFields.join(" "));
        }

        return this;
    }

    // PAGINATION
    paginate() {
        const page = parseInt(this.queryParams.page || "1");
        const limit = parseInt(this.queryParams.limit || "10");

        const offset = (page - 1) * limit;

        this.query = this.query
            .skip(offset)
            .limit(limit);

        return this;
    }

    // SORTING
    sort() {
        this.query = this.query.sort({
            createdAt: -1
        });

        return this;
    }

    // ADD CUSTOM ORDER
    addOrder(order) {
        this.query = this.query.sort(order);

        return this;
    }

    // CUSTOM SORTING
    customSorting(
        sortField = "created_at",
        sortOrder = "DESC"
    ) {
        const validOrder = ["ASC", "DESC"];

        const order = validOrder.includes(
            sortOrder.toUpperCase()
        )
            ? sortOrder.toUpperCase()
            : "DESC";

        const sortValue = order === "ASC" ? 1 : -1;

        const field =
            sortField && sortField.trim() !== ""
                ? sortField.trim()
                : "created_at";

        this.query = this.query.sort({
            [field]: sortValue
        });

        return this;
    }

    // FINAL QUERY
    async exec() {
        const [data, total] = await Promise.all([
            this.query.exec(),
            this.model.countDocuments(this.query.getFilter())
        ]);

        return {
            total_document: total,
            data
        };
    }
}

module.exports = ApiFeatures;