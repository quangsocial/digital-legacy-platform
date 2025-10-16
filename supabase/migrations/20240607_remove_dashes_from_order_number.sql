-- Migration: Xóa tất cả dấu gạch ngang '-' khỏi order_number trong bảng orders
UPDATE orders SET order_number = REPLACE(order_number, '-', '') WHERE order_number LIKE '%-%';
