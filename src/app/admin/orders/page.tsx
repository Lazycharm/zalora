import { OrdersClient } from './orders-client'

export const metadata = {
  title: 'Orders - Admin',
  description: 'Manage customer orders',
}

export default function OrdersPage() {
  return <OrdersClient />
}
