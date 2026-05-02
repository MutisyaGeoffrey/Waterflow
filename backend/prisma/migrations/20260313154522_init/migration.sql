-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "mpesaBusinessNumber" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pin_code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "container_sizes" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "size_liters" INTEGER NOT NULL,
    "price_per_liter" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "container_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "container_size_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total_liters" INTEGER NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "payment_method" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "mpesa_reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced_at" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_reports" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "report_date" TIMESTAMP(3) NOT NULL,
    "total_liters" INTEGER NOT NULL,
    "total_revenue" DOUBLE PRECISION NOT NULL,
    "cash_total" DOUBLE PRECISION NOT NULL,
    "mpesa_total" DOUBLE PRECISION NOT NULL,
    "pickup_count" INTEGER NOT NULL,
    "delivery_count" INTEGER NOT NULL,
    "employee_breakdown" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "businesses_phone_key" ON "businesses"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "employees_business_id_pin_code_key" ON "employees"("business_id", "pin_code");

-- CreateIndex
CREATE UNIQUE INDEX "container_sizes_business_id_size_liters_key" ON "container_sizes"("business_id", "size_liters");

-- CreateIndex
CREATE INDEX "transactions_business_id_created_at_idx" ON "transactions"("business_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "daily_reports_business_id_report_date_key" ON "daily_reports"("business_id", "report_date");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_sizes" ADD CONSTRAINT "container_sizes_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_container_size_id_fkey" FOREIGN KEY ("container_size_id") REFERENCES "container_sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
