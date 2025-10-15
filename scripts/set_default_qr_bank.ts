// Script: Set default QR bank account for demo
import { createAdminClient } from '../src/lib/supabase/admin';

async function main() {
  const admin = createAdminClient();
  // Deactivate all
  await admin.from('payment_qr_bank_accounts').update({ active: false });
  // Insert or upsert default
  const { data, error } = await admin.from('payment_qr_bank_accounts').upsert([
    {
      bank_code: 'MBB',
      bank_name: 'MB Bank',
      account_number: '836266668888',
      account_holder: 'Nguyễn Tâm Quang',
      qr_template: 'compact2',
      description_template: 'DH {order_number}',
      include_amount: true,
      active: true,
      sort_order: 0,
    }
  ], { onConflict: 'account_number' });
  if (error) throw error;
  console.log('Default QR bank set:', data);
}

main().catch(console.error);
