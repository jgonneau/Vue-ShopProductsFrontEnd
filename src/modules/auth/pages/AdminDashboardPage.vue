<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { normalizeApiError } from '../../../shared/api/errors'
import PaginationControls from '../../../shared/ui/PaginationControls.vue'
import StatusBadge from '../../../shared/ui/StatusBadge.vue'
import { useToastBus } from '../../../shared/ui/toast-bus'
import {
  useActivateAdminProduct,
  useAdminInvoices,
  useAdminLogs,
  useAdminLogStats,
  useAdminOrders,
  useAdminProducts,
  useAdminStores,
  useAdminUsers,
  useBulkDeleteAdminLogs,
  useChangeAdminUserPassword,
  useClearAdminLogsBySeverity,
  useCreateAdminInvoice,
  useCreateAdminOrder,
  useCreateAdminProduct,
  useCreateAdminStore,
  useCreateAdminUser,
  useDeactivateAdminProduct,
  useDeleteAdminInvoice,
  useDeleteAdminOrder,
  useDeleteAdminProduct,
  useDeleteAdminStore,
  useDeleteAdminUser,
  useUpdateAdminOrderStatus,
  useUpdateAdminProductStock,
  useUpdateAdminInvoiceStatus,
} from '../../admin/composables/useAdminResources'
import AuthNav from '../components/AuthNav.vue'

const route = useRoute()
const router = useRouter()
const { pushToast } = useToastBus()

const usersPage = computed(() => Number(route.query.usersPage ?? 1))
const storesPage = computed(() => Number(route.query.storesPage ?? 1))
const productsPage = computed(() => Number(route.query.productsPage ?? 1))
const ordersPage = computed(() => Number(route.query.ordersPage ?? 1))
const invoicesPage = computed(() => Number(route.query.invoicesPage ?? 1))
const logsPage = computed(() => Number(route.query.logsPage ?? 1))

const orderFilters = reactive({
  status: '',
  customer: '',
  store: '',
})

const logFilters = reactive({
  severity: '',
  source: '',
})

const usersQuery = useAdminUsers(usersPage)
const storesQuery = useAdminStores(storesPage)
const productsQuery = useAdminProducts(productsPage)
const ordersQuery = useAdminOrders(
  ordersPage,
  computed(() => ({
    status: orderFilters.status || undefined,
    customer: orderFilters.customer || undefined,
    store: orderFilters.store || undefined,
  })),
)
const invoicesQuery = useAdminInvoices(invoicesPage)
const logsQuery = useAdminLogs(
  logsPage,
  computed(() => ({
    severity: logFilters.severity || undefined,
    source: logFilters.source || undefined,
  })),
)
const logStatsQuery = useAdminLogStats()

const createUserMutation = useCreateAdminUser()
const changePasswordMutation = useChangeAdminUserPassword()
const deleteUserMutation = useDeleteAdminUser()
const createStoreMutation = useCreateAdminStore()
const deleteStoreMutation = useDeleteAdminStore()
const createProductMutation = useCreateAdminProduct()
const deleteProductMutation = useDeleteAdminProduct()
const updateProductStockMutation = useUpdateAdminProductStock()
const activateProductMutation = useActivateAdminProduct()
const deactivateProductMutation = useDeactivateAdminProduct()
const createOrderMutation = useCreateAdminOrder()
const updateOrderStatusMutation = useUpdateAdminOrderStatus()
const deleteOrderMutation = useDeleteAdminOrder()
const createInvoiceMutation = useCreateAdminInvoice()
const updateInvoiceStatusMutation = useUpdateAdminInvoiceStatus()
const deleteInvoiceMutation = useDeleteAdminInvoice()
const bulkDeleteLogsMutation = useBulkDeleteAdminLogs()
const clearLogsBySeverityMutation = useClearAdminLogsBySeverity()

const userForm = reactive({
  email: '',
  username: '',
  password: '',
  role: 'customer',
  is_staff: false,
  is_superuser: false,
  is_active: true,
})
const adminPasswordForm = reactive({
  user_id: '',
  new_password: '',
  new_password_confirm: '',
})
const adminDeleteUserId = ref('')

const storeForm = reactive({
  name: '',
  owner: '',
  city: '',
  country: '',
  description: '',
})
const deleteStoreId = ref('')

const productForm = reactive({
  reference: '',
  title: '',
  price: '',
  stock_quantity: 0,
  store: '',
  description: '',
  activated: true,
})
const stockUpdateForm = reactive({
  productId: '',
  stock: 0,
})
const toggleActivationId = ref('')
const deleteProductId = ref('')

const orderForm = reactive({
  reference: '',
  total: '',
  status: 'pending',
  customer: '',
  store: '',
  productsCsv: '',
})
const orderStatusForm = reactive({
  orderId: '',
  status: 'processing',
})
const deleteOrderId = ref('')

const invoiceForm = reactive({
  reference: '',
  total: '',
  status: 'pending',
  customer: '',
  store: '',
})
const invoiceStatusForm = reactive({
  invoiceId: '',
  status: 'paid',
})
const deleteInvoiceId = ref('')

const logBulkIdsCsv = ref('')
const logClearSeverity = ref('error')

const feedbackMessage = ref<string | null>(null)
const feedbackError = ref<string | null>(null)

const setPage = async (
  key: 'usersPage' | 'storesPage' | 'productsPage' | 'ordersPage' | 'invoicesPage' | 'logsPage',
  value: number,
) => {
  await router.replace({
    name: 'admin-dashboard',
    query: {
      ...route.query,
      [key]: String(Math.max(1, value)),
    },
  })
}

const withFeedback = async (action: () => Promise<unknown>, successMessage: string) => {
  feedbackError.value = null
  feedbackMessage.value = null
  try {
    await action()
    feedbackMessage.value = successMessage
    pushToast(successMessage, 'success')
  } catch (error) {
    const message = normalizeApiError(error).message
    feedbackError.value = message
    pushToast(message, 'error')
  }
}

const onCreateUser = async () => {
  await withFeedback(async () => {
    await createUserMutation.mutateAsync({
      email: userForm.email.trim(),
      username: userForm.username.trim() || undefined,
      password: userForm.password,
      role: userForm.role,
      is_staff: userForm.is_staff,
      is_superuser: userForm.is_superuser,
      is_active: userForm.is_active,
    })
  }, 'Admin user created.')
}

const onChangeUserPassword = async () => {
  await withFeedback(async () => {
    await changePasswordMutation.mutateAsync({
      user_id: adminPasswordForm.user_id,
      new_password: adminPasswordForm.new_password,
      new_password_confirm: adminPasswordForm.new_password_confirm,
    })
  }, 'User password changed.')
}

const onDeleteUser = async () => {
  await withFeedback(async () => {
    await deleteUserMutation.mutateAsync({ user_id: adminDeleteUserId.value })
  }, 'User deleted.')
}

const onCreateStore = async () => {
  await withFeedback(async () => {
    await createStoreMutation.mutateAsync({
      name: storeForm.name.trim(),
      owner: storeForm.owner.trim(),
      city: storeForm.city.trim(),
      country: storeForm.country.trim(),
      description: storeForm.description.trim(),
    })
  }, 'Store created.')
}

const onDeleteStore = async () => {
  await withFeedback(async () => {
    await deleteStoreMutation.mutateAsync(deleteStoreId.value)
  }, 'Store deleted.')
}

const onCreateProduct = async () => {
  await withFeedback(async () => {
    await createProductMutation.mutateAsync({
      reference: productForm.reference.trim(),
      title: productForm.title.trim(),
      price: productForm.price,
      stock_quantity: Number(productForm.stock_quantity),
      store: productForm.store.trim(),
      description: productForm.description.trim(),
      activated: productForm.activated,
    })
  }, 'Product created.')
}

const onDeleteProduct = async () => {
  await withFeedback(async () => {
    await deleteProductMutation.mutateAsync(deleteProductId.value)
  }, 'Product deleted.')
}

const onUpdateProductStock = async () => {
  await withFeedback(async () => {
    await updateProductStockMutation.mutateAsync({
      id: stockUpdateForm.productId,
      stock: Number(stockUpdateForm.stock),
    })
  }, 'Product stock updated.')
}

const onToggleProductActivation = async () => {
  const product = productsQuery.data.value?.results.find(
    (item) => item.id === toggleActivationId.value,
  )
  if (!product) {
    feedbackError.value = 'Choose a valid product to toggle activation.'
    return
  }
  await withFeedback(async () => {
    if (product.activated) {
      await deactivateProductMutation.mutateAsync(toggleActivationId.value)
    } else {
      await activateProductMutation.mutateAsync(toggleActivationId.value)
    }
  }, 'Product activation updated.')
}

const onCreateOrder = async () => {
  await withFeedback(async () => {
    await createOrderMutation.mutateAsync({
      reference: orderForm.reference.trim(),
      total: orderForm.total,
      status: orderForm.status,
      customer: orderForm.customer.trim(),
      store: orderForm.store.trim(),
      products: orderForm.productsCsv
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    })
  }, 'Order created.')
}

const onUpdateOrderStatus = async () => {
  await withFeedback(async () => {
    await updateOrderStatusMutation.mutateAsync({
      id: orderStatusForm.orderId,
      status: orderStatusForm.status,
    })
  }, 'Order status updated.')
}

const onDeleteOrder = async () => {
  await withFeedback(async () => {
    await deleteOrderMutation.mutateAsync(deleteOrderId.value)
  }, 'Order deleted.')
}

const onCreateInvoice = async () => {
  await withFeedback(async () => {
    await createInvoiceMutation.mutateAsync({
      reference: invoiceForm.reference.trim(),
      total: invoiceForm.total,
      status: invoiceForm.status,
      customer: invoiceForm.customer.trim(),
      store: invoiceForm.store.trim(),
    })
  }, 'Invoice created.')
}

const onUpdateInvoiceStatus = async () => {
  await withFeedback(async () => {
    await updateInvoiceStatusMutation.mutateAsync({
      id: invoiceStatusForm.invoiceId,
      status: invoiceStatusForm.status,
    })
  }, 'Invoice status updated.')
}

const onDeleteInvoice = async () => {
  await withFeedback(async () => {
    await deleteInvoiceMutation.mutateAsync(deleteInvoiceId.value)
  }, 'Invoice deleted.')
}

const onBulkDeleteLogs = async () => {
  await withFeedback(async () => {
    const ids = logBulkIdsCsv.value
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
    await bulkDeleteLogsMutation.mutateAsync(ids)
  }, 'Logs deleted in bulk.')
}

const onClearLogsBySeverity = async () => {
  await withFeedback(async () => {
    await clearLogsBySeverityMutation.mutateAsync(logClearSeverity.value)
  }, 'Logs cleared by severity.')
}
</script>

<template>
  <main class="container">
    <AuthNav />
    <h1>Admin Operations Console</h1>
    <p>Manage users, stores, products, orders, invoices, and logs.</p>

    <section v-if="feedbackMessage || feedbackError" class="panel">
      <p v-if="feedbackMessage" class="success">{{ feedbackMessage }}</p>
      <p v-if="feedbackError" class="error">{{ feedbackError }}</p>
    </section>

    <section class="panel">
      <h2>Users</h2>
      <form class="form admin-form" @submit.prevent="onCreateUser">
        <label>
          Email
          <input v-model="userForm.email" type="email" required />
        </label>
        <label>
          Username
          <input v-model="userForm.username" type="text" />
        </label>
        <label>
          Password
          <input v-model="userForm.password" type="password" required />
        </label>
        <label>
          Role
          <select v-model="userForm.role">
            <option value="admin">admin</option>
            <option value="vendor">vendor</option>
            <option value="customer">customer</option>
            <option value="guest">guest</option>
          </select>
        </label>
        <button type="submit" :disabled="createUserMutation.isPending.value">Create user</button>
      </form>

      <form class="form admin-form" @submit.prevent="onChangeUserPassword">
        <label>
          User ID
          <input v-model="adminPasswordForm.user_id" type="text" required />
        </label>
        <label>
          New password
          <input v-model="adminPasswordForm.new_password" type="password" required />
        </label>
        <label>
          Confirm password
          <input v-model="adminPasswordForm.new_password_confirm" type="password" required />
        </label>
        <button type="submit" :disabled="changePasswordMutation.isPending.value">
          Change user password
        </button>
      </form>

      <form class="form admin-form" @submit.prevent="onDeleteUser">
        <label>
          User ID to delete
          <input v-model="adminDeleteUserId" type="text" required />
        </label>
        <button type="submit" :disabled="deleteUserMutation.isPending.value">Delete user</button>
      </form>

      <p v-if="usersQuery.isPending.value">Loading users...</p>
      <p v-else-if="usersQuery.isError.value" class="error">Unable to load users.</p>
      <ul v-if="(usersQuery.data.value?.results.length ?? 0) > 0" class="catalog-grid">
        <li
          v-for="user in usersQuery.data.value?.results ?? []"
          :key="user.id"
          class="catalog-card"
        >
          <h3>{{ user.email }}</h3>
          <p><strong>ID:</strong> {{ user.id }}</p>
          <p><strong>Role:</strong> {{ user.role }}</p>
          <p><strong>Active:</strong> {{ user.is_active ? 'Yes' : 'No' }}</p>
          <p><strong>Staff:</strong> {{ user.is_staff ? 'Yes' : 'No' }}</p>
        </li>
      </ul>
      <p v-else-if="!usersQuery.isPending.value && !usersQuery.isError.value">No users found.</p>
      <PaginationControls
        :page="usersPage"
        :has-previous="Boolean(usersQuery.data.value?.previous)"
        :has-next="Boolean(usersQuery.data.value?.next)"
        @previous="setPage('usersPage', usersPage - 1)"
        @next="setPage('usersPage', usersPage + 1)"
      />
    </section>

    <section class="panel">
      <h2>Stores</h2>
      <form class="form admin-form" @submit.prevent="onCreateStore">
        <label>
          Name
          <input v-model="storeForm.name" type="text" required />
        </label>
        <label>
          Owner user ID
          <input v-model="storeForm.owner" type="text" required />
        </label>
        <label>
          City
          <input v-model="storeForm.city" type="text" />
        </label>
        <label>
          Country
          <input v-model="storeForm.country" type="text" />
        </label>
        <label>
          Description
          <input v-model="storeForm.description" type="text" />
        </label>
        <button type="submit" :disabled="createStoreMutation.isPending.value">Create store</button>
      </form>

      <form class="form admin-form" @submit.prevent="onDeleteStore">
        <label>
          Store ID to delete
          <input v-model="deleteStoreId" type="text" required />
        </label>
        <button type="submit" :disabled="deleteStoreMutation.isPending.value">Delete store</button>
      </form>

      <p v-if="storesQuery.isPending.value">Loading stores...</p>
      <p v-else-if="storesQuery.isError.value" class="error">Unable to load stores.</p>
      <ul v-if="(storesQuery.data.value?.results.length ?? 0) > 0" class="catalog-grid">
        <li
          v-for="store in storesQuery.data.value?.results ?? []"
          :key="store.id"
          class="catalog-card"
        >
          <h3>{{ store.name }}</h3>
          <p><strong>ID:</strong> {{ store.id }}</p>
          <p><strong>Owner:</strong> {{ store.owner_email }}</p>
          <p><strong>City:</strong> {{ store.city || '-' }}</p>
        </li>
      </ul>
      <p v-else-if="!storesQuery.isPending.value && !storesQuery.isError.value">No stores found.</p>
      <PaginationControls
        :page="storesPage"
        :has-previous="Boolean(storesQuery.data.value?.previous)"
        :has-next="Boolean(storesQuery.data.value?.next)"
        @previous="setPage('storesPage', storesPage - 1)"
        @next="setPage('storesPage', storesPage + 1)"
      />
    </section>

    <section class="panel">
      <h2>Products</h2>
      <form class="form admin-form" @submit.prevent="onCreateProduct">
        <label>
          Reference
          <input v-model="productForm.reference" type="text" required />
        </label>
        <label>
          Title
          <input v-model="productForm.title" type="text" required />
        </label>
        <label>
          Store ID
          <input v-model="productForm.store" type="text" required />
        </label>
        <label>
          Price
          <input v-model="productForm.price" type="text" required />
        </label>
        <label>
          Stock
          <input v-model.number="productForm.stock_quantity" type="number" min="0" />
        </label>
        <button type="submit" :disabled="createProductMutation.isPending.value">
          Create product
        </button>
      </form>

      <form class="form admin-form" @submit.prevent="onUpdateProductStock">
        <label>
          Product ID
          <input v-model="stockUpdateForm.productId" type="text" required />
        </label>
        <label>
          New stock
          <input v-model.number="stockUpdateForm.stock" type="number" min="0" required />
        </label>
        <button type="submit" :disabled="updateProductStockMutation.isPending.value">
          Update stock
        </button>
      </form>

      <form class="form admin-form" @submit.prevent="onToggleProductActivation">
        <label>
          Product ID
          <input v-model="toggleActivationId" type="text" required />
        </label>
        <button
          type="submit"
          :disabled="
            activateProductMutation.isPending.value || deactivateProductMutation.isPending.value
          "
        >
          Toggle activation
        </button>
      </form>

      <form class="form admin-form" @submit.prevent="onDeleteProduct">
        <label>
          Product ID to delete
          <input v-model="deleteProductId" type="text" required />
        </label>
        <button type="submit" :disabled="deleteProductMutation.isPending.value">
          Delete product
        </button>
      </form>

      <p v-if="productsQuery.isPending.value">Loading products...</p>
      <p v-else-if="productsQuery.isError.value" class="error">Unable to load products.</p>
      <ul v-if="(productsQuery.data.value?.results.length ?? 0) > 0" class="catalog-grid">
        <li
          v-for="product in productsQuery.data.value?.results ?? []"
          :key="product.id"
          class="catalog-card"
        >
          <h3>{{ product.title }}</h3>
          <p><strong>ID:</strong> {{ product.id }}</p>
          <p><strong>Store:</strong> {{ product.store_name }}</p>
          <p><strong>Price:</strong> ${{ product.price }}</p>
          <p><strong>Stock:</strong> {{ product.stock_quantity }}</p>
          <p><strong>Active:</strong> {{ product.activated ? 'Yes' : 'No' }}</p>
        </li>
      </ul>
      <p v-else-if="!productsQuery.isPending.value && !productsQuery.isError.value">
        No products found.
      </p>
      <PaginationControls
        :page="productsPage"
        :has-previous="Boolean(productsQuery.data.value?.previous)"
        :has-next="Boolean(productsQuery.data.value?.next)"
        @previous="setPage('productsPage', productsPage - 1)"
        @next="setPage('productsPage', productsPage + 1)"
      />
    </section>

    <section class="panel">
      <h2>Orders</h2>
      <form class="form admin-form" @submit.prevent="onCreateOrder">
        <label>
          Reference
          <input v-model="orderForm.reference" type="text" required />
        </label>
        <label>
          Total
          <input v-model="orderForm.total" type="text" required />
        </label>
        <label>
          Customer ID
          <input v-model="orderForm.customer" type="text" required />
        </label>
        <label>
          Store ID
          <input v-model="orderForm.store" type="text" required />
        </label>
        <label>
          Status
          <select v-model="orderForm.status">
            <option value="pending">pending</option>
            <option value="processing">processing</option>
            <option value="shipped">shipped</option>
            <option value="delivered">delivered</option>
            <option value="cancelled">cancelled</option>
          </select>
        </label>
        <label>
          Product IDs (comma separated)
          <input v-model="orderForm.productsCsv" type="text" placeholder="id1,id2,id3" />
        </label>
        <button type="submit" :disabled="createOrderMutation.isPending.value">Create order</button>
      </form>

      <div class="toolbar">
        <label>
          Filter status
          <select v-model="orderFilters.status">
            <option value="">all</option>
            <option value="pending">pending</option>
            <option value="processing">processing</option>
            <option value="shipped">shipped</option>
            <option value="delivered">delivered</option>
            <option value="cancelled">cancelled</option>
          </select>
        </label>
        <label>
          Filter customer ID
          <input v-model="orderFilters.customer" type="text" />
        </label>
        <label>
          Filter store ID
          <input v-model="orderFilters.store" type="text" />
        </label>
      </div>

      <form class="form admin-form" @submit.prevent="onUpdateOrderStatus">
        <label>
          Order ID
          <input v-model="orderStatusForm.orderId" type="text" required />
        </label>
        <label>
          New status
          <select v-model="orderStatusForm.status">
            <option value="pending">pending</option>
            <option value="processing">processing</option>
            <option value="shipped">shipped</option>
            <option value="delivered">delivered</option>
            <option value="cancelled">cancelled</option>
          </select>
        </label>
        <button type="submit" :disabled="updateOrderStatusMutation.isPending.value">
          Update order status
        </button>
      </form>

      <form class="form admin-form" @submit.prevent="onDeleteOrder">
        <label>
          Order ID to delete
          <input v-model="deleteOrderId" type="text" required />
        </label>
        <button type="submit" :disabled="deleteOrderMutation.isPending.value">Delete order</button>
      </form>

      <p v-if="ordersQuery.isPending.value">Loading orders...</p>
      <p v-else-if="ordersQuery.isError.value" class="error">Unable to load orders.</p>
      <ul v-if="(ordersQuery.data.value?.results.length ?? 0) > 0" class="catalog-grid">
        <li
          v-for="order in ordersQuery.data.value?.results ?? []"
          :key="order.id"
          class="catalog-card"
        >
          <h3>{{ order.reference }}</h3>
          <p><strong>ID:</strong> {{ order.id }}</p>
          <p><strong>Customer:</strong> {{ order.customer_email }}</p>
          <p><strong>Store:</strong> {{ order.store_name }}</p>
          <p><strong>Total:</strong> ${{ order.total }}</p>
          <p>
            <strong>Status:</strong>
            <StatusBadge :status="order.status" />
          </p>
        </li>
      </ul>
      <p v-else-if="!ordersQuery.isPending.value && !ordersQuery.isError.value">No orders found.</p>
      <PaginationControls
        :page="ordersPage"
        :has-previous="Boolean(ordersQuery.data.value?.previous)"
        :has-next="Boolean(ordersQuery.data.value?.next)"
        @previous="setPage('ordersPage', ordersPage - 1)"
        @next="setPage('ordersPage', ordersPage + 1)"
      />
    </section>

    <section class="panel">
      <h2>Invoices</h2>
      <form class="form admin-form" @submit.prevent="onCreateInvoice">
        <label>
          Reference
          <input v-model="invoiceForm.reference" type="text" required />
        </label>
        <label>
          Total
          <input v-model="invoiceForm.total" type="text" required />
        </label>
        <label>
          Customer ID
          <input v-model="invoiceForm.customer" type="text" required />
        </label>
        <label>
          Store ID
          <input v-model="invoiceForm.store" type="text" required />
        </label>
        <label>
          Status
          <select v-model="invoiceForm.status">
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="cancelled">cancelled</option>
            <option value="refunded">refunded</option>
            <option value="partially_refunded">partially_refunded</option>
          </select>
        </label>
        <button type="submit" :disabled="createInvoiceMutation.isPending.value">
          Create invoice
        </button>
      </form>

      <form class="form admin-form" @submit.prevent="onUpdateInvoiceStatus">
        <label>
          Invoice ID
          <input v-model="invoiceStatusForm.invoiceId" type="text" required />
        </label>
        <label>
          New status
          <select v-model="invoiceStatusForm.status">
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="cancelled">cancelled</option>
            <option value="refunded">refunded</option>
            <option value="partially_refunded">partially_refunded</option>
          </select>
        </label>
        <button type="submit" :disabled="updateInvoiceStatusMutation.isPending.value">
          Update invoice status
        </button>
      </form>

      <form class="form admin-form" @submit.prevent="onDeleteInvoice">
        <label>
          Invoice ID to delete
          <input v-model="deleteInvoiceId" type="text" required />
        </label>
        <button type="submit" :disabled="deleteInvoiceMutation.isPending.value">
          Delete invoice
        </button>
      </form>

      <p v-if="invoicesQuery.isPending.value">Loading invoices...</p>
      <p v-else-if="invoicesQuery.isError.value" class="error">Unable to load invoices.</p>
      <ul v-if="(invoicesQuery.data.value?.results.length ?? 0) > 0" class="catalog-grid">
        <li
          v-for="invoice in invoicesQuery.data.value?.results ?? []"
          :key="invoice.id"
          class="catalog-card"
        >
          <h3>{{ invoice.reference }}</h3>
          <p><strong>ID:</strong> {{ invoice.id }}</p>
          <p><strong>Customer:</strong> {{ invoice.customer_email }}</p>
          <p><strong>Store:</strong> {{ invoice.store_name }}</p>
          <p><strong>Total:</strong> ${{ invoice.total }}</p>
          <p>
            <strong>Status:</strong>
            <StatusBadge :status="invoice.status" />
          </p>
        </li>
      </ul>
      <p v-else-if="!invoicesQuery.isPending.value && !invoicesQuery.isError.value">
        No invoices found.
      </p>
      <PaginationControls
        :page="invoicesPage"
        :has-previous="Boolean(invoicesQuery.data.value?.previous)"
        :has-next="Boolean(invoicesQuery.data.value?.next)"
        @previous="setPage('invoicesPage', invoicesPage - 1)"
        @next="setPage('invoicesPage', invoicesPage + 1)"
      />
    </section>

    <section class="panel">
      <h2>Logs</h2>

      <section class="panel">
        <h3>Log stats</h3>
        <p v-if="logStatsQuery.isPending.value">Loading log statistics...</p>
        <p v-else-if="logStatsQuery.isError.value" class="error">Unable to load log statistics.</p>
        <p><strong>Total logs:</strong> {{ logStatsQuery.data.value?.total ?? 0 }}</p>
        <p>
          <strong>By severity:</strong>
          <span v-for="item in logStatsQuery.data.value?.by_severity ?? []" :key="item.severity">
            {{ item.severity }}={{ item.count }}
          </span>
        </p>
      </section>

      <div class="toolbar">
        <label>
          Severity filter
          <select v-model="logFilters.severity">
            <option value="">all</option>
            <option value="debug">debug</option>
            <option value="info">info</option>
            <option value="warning">warning</option>
            <option value="error">error</option>
            <option value="critical">critical</option>
          </select>
        </label>
        <label>
          Source filter
          <input v-model="logFilters.source" type="text" placeholder="api.admin" />
        </label>
      </div>

      <form class="form admin-form" @submit.prevent="onBulkDeleteLogs">
        <label>
          Log IDs (comma separated)
          <input v-model="logBulkIdsCsv" type="text" placeholder="id1,id2,id3" />
        </label>
        <button type="submit" :disabled="bulkDeleteLogsMutation.isPending.value">
          Bulk delete logs
        </button>
      </form>

      <form class="form admin-form" @submit.prevent="onClearLogsBySeverity">
        <label>
          Severity to clear
          <select v-model="logClearSeverity">
            <option value="debug">debug</option>
            <option value="info">info</option>
            <option value="warning">warning</option>
            <option value="error">error</option>
            <option value="critical">critical</option>
          </select>
        </label>
        <button type="submit" :disabled="clearLogsBySeverityMutation.isPending.value">
          Clear by severity
        </button>
      </form>

      <p v-if="logsQuery.isPending.value">Loading logs...</p>
      <p v-else-if="logsQuery.isError.value" class="error">Unable to load logs.</p>
      <ul v-if="(logsQuery.data.value?.results.length ?? 0) > 0" class="catalog-grid">
        <li v-for="log in logsQuery.data.value?.results ?? []" :key="log.id" class="catalog-card">
          <h3>{{ log.id }}</h3>
          <p>
            <strong>Severity:</strong>
            <StatusBadge :status="log.severity" />
          </p>
          <p><strong>Source:</strong> {{ log.source || '-' }}</p>
          <p><strong>Created:</strong> {{ log.created_at }}</p>
        </li>
      </ul>
      <p v-else-if="!logsQuery.isPending.value && !logsQuery.isError.value">No logs found.</p>
      <PaginationControls
        :page="logsPage"
        :has-previous="Boolean(logsQuery.data.value?.previous)"
        :has-next="Boolean(logsQuery.data.value?.next)"
        @previous="setPage('logsPage', logsPage - 1)"
        @next="setPage('logsPage', logsPage + 1)"
      />
    </section>
  </main>
</template>
