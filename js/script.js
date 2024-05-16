// Función para guardar los jugadores en el localStorage
const guardarJugadoresLocalStorage = (jugadores) => {
    localStorage.setItem('jugadores', JSON.stringify(jugadores));
};

// Función para obtener los jugadores del localStorage
const obtenerJugadoresLocalStorage = () => {
    const jugadoresJSON = localStorage.getItem('jugadores');
    const jugadores = jugadoresJSON ? JSON.parse(jugadoresJSON) : [];

    // Filtrar jugadores con nombre definido
    const jugadoresValidos = jugadores.filter(jugador => jugador.nombre !== null && jugador.nombre !== undefined && jugador.nombre.trim() !== '');
    
    return jugadoresValidos;
};

let formularios = document.getElementById('formularios');

// Función para agregar un jugador
const agregarJugador = () => {
    const nombre = document.getElementById('nombreJugador').value.trim();
    const edad = parseInt(document.getElementById('edadJugador').value);
    const posicion = document.getElementById('posicionJugador').value.trim();
    const estado = document.getElementById('estadoJugador').value.trim();

    if (!nombre || !edad || !posicion || !estado) {
        mostrarMensaje('Todos los campos son obligatorios.', 'error');
        return;
    }

    let jugadores = obtenerJugadoresLocalStorage();

    if (jugadores.find(jugador => jugador.nombre.toLowerCase() === nombre.toLowerCase())) {
        mostrarMensaje('El jugador ya está en el equipo.', 'error');
        return;
    }

    jugadores.push({ nombre, edad, posicion, estado });
    guardarJugadoresLocalStorage(jugadores);
    mostrarMensaje('Jugador agregado correctamente.', 'success');
    
    // Limpiar los campos del formulario
    document.getElementById('nombreJugador').value = '';
    document.getElementById('edadJugador').value = '';
    document.getElementById('posicionJugador').value = '';
    document.getElementById('estadoJugador').value = 'titular';

    // Actualizar la lista de jugadores
    listarJugadores();
};

// Función para listar jugadores
const listarJugadores = async () => {
    try {
        let jugadores = obtenerJugadoresLocalStorage();

        // Asegurar que todos los jugadores tengan un estado definido antes de ordenar
        jugadores = jugadores.filter(jugador => jugador.estado);

        if (jugadores.length === 0) {
            mostrarMensaje('No hay jugadores en el equipo o todos los jugadores existentes no tienen un estado definido.', 'info');
            return;
        }

        // Ordenar jugadores por estado
        jugadores.sort((a, b) => {
            if (a.estado === b.estado) {
                return 0;
            } else if (a.estado === 'titular') {
                return -1;
            } else {
                return 1;
            }
        });

        let listaHTML = '';
        jugadores.forEach(jugador => {
            listaHTML += `
                <li class="list-group-item ${jugador.estado === 'titular' ? 'bg-success' : ''}">
                    Nombre: ${jugador.nombre}, Edad: ${jugador.edad}, Posición: ${jugador.posicion}, Estado: ${jugador.estado}
                    <button class="btn btn-danger btn-sm float-end" onclick="eliminarJugadorDesdeLista('${jugador.nombre}')">Eliminar</button>
                </li>`;
        });

        document.getElementById('listaJugadores').innerHTML = listaHTML;
        document.getElementById('formularioListarJugadores').style.display = 'block';
    } catch (error) {
        mostrarMensaje(`Error al listar jugadores: ${error.message}`, 'error');
    }
};

// Función para eliminar un jugador desde la lista
const eliminarJugadorDesdeLista = (nombreJugador) => {
    try {
        let jugadores = obtenerJugadoresLocalStorage();
        const indiceJugador = jugadores.findIndex(jugador => jugador.nombre.toLowerCase() === nombreJugador.toLowerCase());

        if (indiceJugador === -1) {
            throw new Error('El jugador no está en el equipo.');
        }

        jugadores.splice(indiceJugador, 1);
        guardarJugadoresLocalStorage(jugadores);
        listarJugadores();
        mostrarMensaje(`Jugador ${nombreJugador} eliminado correctamente.`, 'success');
    } catch (error) {
        mostrarMensaje(`Error al eliminar jugador: ${error.message}`, 'error');
    }
};

// Función para asignar una nueva posición a un jugador
const asignarPosicion = async () => {
    try {
        const nombreJugador = document.getElementById('nombreJugadorAsignarPosicion').value;
        const nuevaPosicion = document.getElementById('nuevaPosicion').value;

        if (!nombreJugador || !nuevaPosicion) {
            throw new Error('Debe ingresar el nombre del jugador y la nueva posición.');
        }

        let jugadores = obtenerJugadoresLocalStorage();

        const jugadorIndex = jugadores.findIndex(jugador => jugador.nombre === nombreJugador);

        if (jugadorIndex === -1) {
            throw new Error('El jugador no está en el equipo.');
        }

        jugadores[jugadorIndex].posicion = nuevaPosicion;

        guardarJugadoresLocalStorage(jugadores);

        mostrarMensaje(`La posición de ${nombreJugador} ha sido actualizada a ${nuevaPosicion}.`, 'success');
    } catch (error) {
        mostrarMensaje(`Error al asignar posición: ${error.message}`, 'error');
    }
};

// Función para realizar un cambio durante un partido
const realizarCambio = async () => {
    try {
        const jugadorEntranteNombre = document.getElementById('jugadorEntrante').value.trim().toLowerCase();
        const jugadorSalienteNombre = document.getElementById('jugadorSaliente').value.trim().toLowerCase();

        let jugadores = obtenerJugadoresLocalStorage();

        // Verificar que los jugadores tengan nombre definido
        if (jugadores.some(jugador => !jugador.nombre)) {
            throw new Error('Uno o más jugadores tienen un nombre no definido.');
        }

        const entranteIndex = jugadores.findIndex(jugador => jugador.nombre.toLowerCase() === jugadorEntranteNombre);
        const salienteIndex = jugadores.findIndex(jugador => jugador.nombre.toLowerCase() === jugadorSalienteNombre);

        if (entranteIndex === -1 || salienteIndex === -1) {
            throw new Error('Uno o ambos jugadores no están en el equipo. Verifique los nombres ingresados.');
        }

        // Verificar que el cambio es entre un titular y un suplente
        if (jugadores[entranteIndex].estado === jugadores[salienteIndex].estado) {
            throw new Error('No se puede realizar el cambio entre jugadores del mismo estado.');
        }

        // Verificar que el jugador entrante sea suplente y el saliente titular
        if (jugadores[entranteIndex].estado !== "suplente" && jugadores[salienteIndex].estado !== "titular") {
            throw new Error('El jugador entrante debe ser suplente y el saliente titular.');
        }

        // Intercambiar estados
        [jugadores[entranteIndex].estado, jugadores[salienteIndex].estado] = [jugadores[salienteIndex].estado, jugadores[entranteIndex].estado];

        // Actualizar el estado en el localStorage
        guardarJugadoresLocalStorage(jugadores);

        mostrarMensaje(`Cambio realizado: ${jugadores[salienteIndex].nombre} por ${jugadores[entranteIndex].nombre}`, 'success');
    } catch (error) {
        mostrarMensaje(`Error al realizar cambio: ${error.message}`, 'error');
    }
};

// Funciones para control de UI
const mostrarMensaje = (mensaje, tipo) => {
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.innerHTML = mensaje;
    mensajeDiv.className = tipo;
};

const mostrarFormularioAsignarPosicion = () => {
    ocultarFormulario('formularioRealizarCambio');
    mostrarFormulario('formularioAsignarPosicion');
};

const mostrarFormularioRealizarCambio = () => {
    ocultarFormulario('formularioAsignarPosicion');
    mostrarFormulario('formularioRealizarCambio');
};

const mostrarFormulario = (id) => {
    console.log(id);
    if(id==='formularioAgregarJugador'){
        let listaHTML = '';
        listaHTML += `
        <div class="card-body">
        <h2 class="mb-4 bg-dark text-light p-3 rounded">Agregar jugador</h2>
        <input type="text" id="nombreJugador" class="form-control mb-2" placeholder="Nombre del jugador">
        <input type="number" id="edadJugador" class="form-control mb-2" placeholder="Edad del jugador">
        <input type="text" id="posicionJugador" class="form-control mb-2" placeholder="Posición del jugador">
        <select id="estadoJugador" class="form-select mb-2">
            <option value="titular">Titular</option>
            <option value="suplente">Suplente</option>
        </select>
            <button class="btn btn-success" onclick="agregarJugador()">Agregar jugador</button>
        </div>`;
    document.getElementById('formularios').innerHTML = listaHTML;
    }else if(id==='formularioAsignarPosicion'){
        let listaHTML = '';
        listaHTML += `
        <div class="card-body">
        <h2 class="mb-4 bg-dark text-light p-3 rounded">Asignar posición</h2>
        <input type="text" id="nombreJugadorAsignarPosicion" class="form-control mb-2" placeholder="Nombre del jugador">
        <input type="text" id="nuevaPosicion" class="form-control mb-2" placeholder="Nueva posición">
        <button class="btn btn-success" onclick="asignarPosicion()">Asignar posición</button>
    </div>`;
    document.getElementById('formularios').innerHTML = listaHTML;
    }else if(id==='formularioRealizarCambio'){
        let listaHTML = '';
        listaHTML += `
            <div class="card-body">
                <h2 class="mb-4 bg-dark text-light p-3 rounded">Realizar cambio durante el partido</h2>
                <input type="text" id="jugadorEntrante" class="form-control mb-2" placeholder="Jugador entrante">
                <input type="text" id="jugadorSaliente" class="form-control mb-2" placeholder="Jugador saliente">
                <button class="btn btn-success" onclick="realizarCambio()">Realizar cambio</button>
            </div>`;
    document.getElementById('formularios').innerHTML = listaHTML;
    }
    // const formulario = document.getElementById(id);
    // formulario.style.display = 'block';
};

const ocultarFormulario = (id) => {
    const formulario = document.getElementById(id);
    formulario.style.display = 'none';
};

// Función para mostrar el formulario para eliminar un jugador
const mostrarFormularioEliminarJugador = () => {
    ocultarFormulario('formularioAsignarPosicion');
    ocultarFormulario('formularioRealizarCambio');
    mostrarFormulario('formularioEliminarJugador');
};
