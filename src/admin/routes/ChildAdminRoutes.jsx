import { Navigate } from "react-router-dom";
import dashboardRoutes from '../modules/dashboard/routes'
import clientesRoutes from '../modules/clientes/routes'
import prestamosRoutes from '../modules/prestamos/routes'
import administracionRoutes from '../modules/administracion/routes'


export default [
    ...dashboardRoutes,
    ...clientesRoutes,
    ...prestamosRoutes,
    ...administracionRoutes,
    {path:'*', to:'dashboard', element: Navigate}
]