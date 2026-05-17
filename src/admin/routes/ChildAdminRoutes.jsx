import { Navigate } from "react-router-dom";
import dashboardRoutes from '../modules/dashboard/routes'
import clientesRoutes from '../modules/clientes/routes'
import prestamosRoutes from '../modules/prestamos/routes'
import administracionRoutes from '../modules/administracion/routes'
import reportsRoutes from '../modules/reports/routes'

export default [
    ...dashboardRoutes,
    ...clientesRoutes,
    ...prestamosRoutes,
    ...administracionRoutes,
    ...reportsRoutes,
    {path:'*', to:'dashboard', element: Navigate}
]