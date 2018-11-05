//Para que se cargue la página antes de que llame a la función inicializar
window.onload = inicializar;
// Variable global
var formConvalidaciones;
var refConvalidaciones;
var tbodyTablaConvalidaciones;
var CREATE = "Añadir Convalidación";
var UPDATE = "Actualizar Convalidación";
var modo = CREATE;
var refConvalidacionEditar;

function inicializar() {
    //
    formConvalidaciones = document.getElementById('form-convalidaciones');
    formConvalidaciones.addEventListener("submit", enviarConvalidacionAFirebase, false);

    tbodyTablaConvalidaciones = document.getElementById('tbody-tabla-convalidaciones');

    // hacemos referencia al nodo raíz de la base de datos de firebase
    refConvalidaciones = firebase.database().ref().child("convalidaciones");

    mostrarConvalidacionesFirebase();
}

function mostrarConvalidacionesFirebase() {
    //Leer convalidaciones, snap devuelve todo el arreglo de convalidaciones que está en Firebase
    refConvalidaciones.on('value', function (snap) {
        var datos = snap.val(); // valores del array
        var filasAMostrar = "";
        for (var key in datos) {
            // generar una fila en la tabla de convalidaciones
            filasAMostrar += "<tr>" +
                "<td>" + datos[key].cicloAConvalidar + "</td>" +
                "<td>" + datos[key].moduloAConvalidar + "</td>" +
                "<td>" + datos[key].cicloAportado + "</td>" +
                "<td>" + datos[key].moduloAportado + "</td>" +

                '<td>' +
                '<button class="btn btn-success editar" data-convalidacion="' + key + '">' +
                '<i class="fas fa-edit"></i>' +
                '</button>' +
                '</td>' +

                '<td>' +
                '<button class="btn btn-danger borrar" data-convalidacion="' + key + '">' +
                '<i class="fas fa-trash-alt"></i>' +
                '</button>' +
                '</td>' +
                "</tr>";
        }
        tbodyTablaConvalidaciones.innerHTML = filasAMostrar;
        // Si filasAMostrar es distinto a vacío, se registrará los eventos correspondientes al click del botón eliminar
        if (filasAMostrar != "") {
            var elementosEditables = document.getElementsByClassName("editar");
            for (var i = 0; i < elementosEditables.length; i++) {
                elementosEditables[i].addEventListener("click", editarConvalidacionDeFirebase, false);
            }

            var elementosBorrables = document.getElementsByClassName("borrar");
            for (var i = 0; i < elementosBorrables.length; i++) {
                elementosBorrables[i].addEventListener("click", borrarConvalidacionDeFirebase, false);
            }
        }
    });
}

// Función para editar
function editarConvalidacionDeFirebase() {
    var keyDeConvalidacionAEditar = this.getAttribute("data-convalidacion");
    refConvalidacionAEditar = refConvalidaciones.child(keyDeConvalidacionAEditar);
    // Leer una sola vez
    refConvalidacionAEditar.once("value", function (snap) {
        // El valor correspondiente a editar lo pongo en el formulario nuevamente
        var datos = snap.val();
        document.getElementById("modulo-a-convalidar").value = datos.moduloAConvalidar;
        document.getElementById("ciclo-a-convalidar").value = datos.cicloAConvalidar;
        document.getElementById("modulo-aportado").value = datos.moduloAportado;
        document.getElementById("ciclo-aportado").value = datos.cicloAportado;
    });

    // Hacer que el botón de crear convalidación cambie a actualizar convalidación al momento de editar
    document.getElementById('btn-enviar-convalidacion').value = UPDATE;
    modo = UPDATE;
}

// Función para borrar
function borrarConvalidacionDeFirebase() {
    // Accedo a la key de la convalidación que quiero borrar a través de data-convalidation
    var keyDeConvalidacionABorrar = this.getAttribute("data-convalidacion");
    var refConvalidacionABorrar = refConvalidaciones.child(keyDeConvalidacionABorrar);
    refConvalidacionABorrar.remove();
}

function enviarConvalidacionAFirebase(event) {
    // Prevenir evento por defecto (se evita que se vuelva a cargar la página)
    event.preventDefault();
    switch (modo) {
        case CREATE:
            refConvalidaciones.push({
                //Añadir registro (objeto json que va a ser la nueva convalidación). Firebase crea automáticamente una clave para el objeto creado
                //Se enviarán los datos que introduce el usuario
                moduloAConvalidar: event.target.moduloAConvalidar.value,
                cicloAConvalidar: event.target.cicloAConvalidar.value,
                moduloAportado: event.target.moduloAportado.value,
                cicloAportado: event.target.cicloAportado.value
            });
            break;
        case UPDATE:
            // Para actualizar necesitamos una referencia a la key de la convalidación
            refConvalidacionAEditar.update({
                moduloAConvaliar: event.target.moduloAConvalidar.value,
                cicloAConvalidar: event.target.cicloAConvalidar.value,
                moduloAportado: event.target.moduloAportado.value,
                cicloAportado: event.target.cicloAportado.value
            });
            modo = CREATE;
            document.getElementById("btn-enviar-convalidacion").value = CREATE;
            break;
    }

    // Limpiar formulario al clickear botón
    formConvalidaciones.reset();
}

