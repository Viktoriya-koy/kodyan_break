window.TICKETS = [
    //Listado masivo de 50+ ejercicios para cubrir el silabus completo

    // ==========================================
    // MÓDULO 1: BASIS (Sintaxis, Variables, Control) - 10 Tickets
    // ==========================================
    {
        module: "Módulo 1: Basics", title: "Tipos de Datos I",
        code: `public void registro() {
    // Definir edad de un empleado (número entero)
    _____ edad = 25;
}`,
        options: ["String", "int", "boolean", "float"], correct: 1,
        explanation: "'int' se usa para números enteros. 'String' es para texto."
    },
    {
        module: "Módulo 1: Basics", title: "Tipos de Datos II",
        code: `public void precio() {
    // Precios con decimales
    _____ costo = 99.99;
}`,
        options: ["int", "double", "char", "long"], correct: 1,
        explanation: "'double' es el estándar para decimales en Java."
    },
    {
        module: "Módulo 1: Basics", title: "Booleanos",
        code: `public void estado() {
    // Variable de verdadero/falso
    _____ activo = true;
}`,
        options: ["bool", "boolean", "int", "String"], correct: 1,
        explanation: "En Java el tipo es 'boolean', a diferencia de C++ que usa 'bool'."
    },
    {
        module: "Módulo 1: Basics", title: "Cadenas de Texto",
        code: `public void saludar() {
    _____ nombre = "Vico";
    System.out.println("Hola " + nombre);
}`,
        options: ["Text", "String", "char", "str"], correct: 1,
        explanation: "'String' (con mayúscula) es la clase para cadenas de texto."
    },
    {
        module: "Módulo 1: Basics", title: "Condicional Simple",
        code: `if (puntos _____ 100) {
    System.out.println("Ganaste!");
}`,
        options: ["=", "==", "equals", ":"], correct: 1,
        explanation: "'==' es el operador de comparación. '=' es asignación."
    },
    {
        module: "Módulo 1: Basics", title: "Operador Lógico AND",
        code: `// Tienes usuario Y tienes contraseña
if (user != null _____ pass != null) {
    login();
}`,
        options: ["&", "||", "&&", "and"], correct: 2,
        explanation: "'&&' es el operador lógico AND (Y)."
    },
    {
        module: "Módulo 1: Basics", title: "Bucle For Standard",
        code: `// Iterar 10 veces
for (int i=0; i _____ 10; i++) {
    System.out.println(i);
}`,
        options: ["<", "<=", ">", "=="], correct: 0,
        explanation: "Si empezamos en 0, 'i < 10' va de 0 a 9 (10 iteraciones)."
    },
    {
        module: "Módulo 1: Basics", title: "Incremento",
        code: `int contador = 0;
// Sumar 1 al contador
contador_____;`,
        options: ["++", "+= 1", "--", "**"], correct: 0,
        explanation: "'++' es el operador de incremento unitario."
    },
    {
        module: "Módulo 1: Basics", title: "While Loop",
        code: `// Mientras no termine...
_____ (!terminado) {
    procesar();
}`,
        options: ["for", "while", "if", "loop"], correct: 1,
        explanation: "'while' ejecuta el bloque repetidamente mientras la condición sea true."
    },
    {
        module: "Módulo 1: Basics", title: "Switch Case",
        code: `int dia = 1;
switch (dia) {
    _____ 1: System.out.println("Lunes"); break;
}`,
        options: ["option", "case", "if", "when"], correct: 1,
        explanation: "'case' define cada opción dentro de un bloque switch."
    },

    // ==========================================
    // MÓDULO 2: OOP BASICS (Clases, Objetos) - 10 Tickets
    // ==========================================
    {
        module: "Módulo 2: OOP", title: "Definir Clase",
        code: `public _____ Coche {
    String marca;
}`,
        options: ["struct", "class", "object", "type"], correct: 1,
        explanation: "'class' define la plantilla del objeto."
    },
    {
        module: "Módulo 2: OOP", title: "Instanciación",
        code: `Coche miCoche = _____ Coche();`,
        options: ["create", "new", "make", "init"], correct: 1,
        explanation: "'new' reserva memoria y llama al constructor."
    },
    {
        module: "Módulo 2: OOP", title: "Atributos",
        code: `public class Usuario {
    // Variable que pertenece a la clase
    String nombre; 
    
    public void setNombre(String n) {
        // Asignar al atributo
        _____.nombre = n;
    }
}`,
        options: ["self", "super", "this", "var"], correct: 2,
        explanation: "'this' refiere a la instancia actual."
    },
    {
        module: "Módulo 2: OOP", title: "Constructor Vacio",
        code: `public class Perro {
    // Constructor sin argumentos
    public _____() {
        ladrar();
    }
}`,
        options: ["void", "Perro", "new", "class"], correct: 1,
        explanation: "El constructor se llama igual que la clase y no tiene tipo de retorno."
    },
    {
        module: "Módulo 2: OOP", title: "Método Void",
        code: `// Método que no devuelve nada
public _____ saludar() {
    System.out.println("Hola");
}`,
        options: ["null", "void", "empty", "int"], correct: 1,
        explanation: "'void' indica que el método no retorna valor."
    },
    {
        module: "Módulo 2: OOP", title: "Método Return",
        code: `// Método que devuelve un entero
public _____ sumar(int a, int b) {
    return a + b;
}`,
        options: ["void", "int", "return", "calc"], correct: 1,
        explanation: "Si devuelve un número entero, la firma debe decir 'int'."
    },
    {
        module: "Módulo 2: OOP", title: "Sobrecarga (Overloading)",
        code: `public void dibujar() { ... }
// Mismo nombre, distintos parámetros        
public void dibujar(_____ color) { ... }`,
        options: ["String", "void", "return", "class"], correct: 0,
        explanation: "La sobrecarga permite métodos con mismo nombre pero distinta firma de parámetros."
    },
    {
        module: "Módulo 2: OOP", title: "Static I",
        code: `public class Mate {
    // Método que se usa sin instanciar la clase
    public _____ double PI = 3.14159;
}`,
        options: ["final", "static", "void", "const"], correct: 1,
        explanation: "'static' significa que pertenece a la clase, no al objeto."
    },
    {
        module: "Módulo 2: OOP", title: "Static II",
        code: `// Llamar a un método estático
Math._____(16); // Raíz cuadrada`,
        options: ["sqrt", "new", "calc", "call"], correct: 0,
        explanation: "Math.sqrt() es un método estático, se llama directamente desde la clase Math."
    },
    {
        module: "Módulo 2: OOP", title: "Constantes",
        code: `// Valor que nunca cambia
public static _____ double GRAVEDAD = 9.8;`,
        options: ["const", "final", "var", "int"], correct: 1,
        explanation: "En Java, 'final' se usa para definir constantes."
    },

    // ==========================================
    // MÓDULO 3: ENCAPSULAMIENTO - 10 Tickets
    // ==========================================
    {
        module: "Módulo 3: Encapsulation", title: "Privacidad",
        code: `public class Banco {
    // Solo accesible desde esta clase
    _____ double dineroBoveda;
}`,
        options: ["public", "private", "protected", "global"], correct: 1,
        explanation: "'private' oculta el dato al exterior."
    },
    {
        module: "Módulo 3: Encapsulation", title: "Acceso Público",
        code: `public class Tienda {
    // Accesible desde cualquier lugar
    _____ String nombreTienda;
}`,
        options: ["private", "public", "protected", "local"], correct: 1,
        explanation: "'public' expone el dato a todo el proyecto."
    },
    {
        module: "Módulo 3: Encapsulation", title: "Getter",
        code: `private int edad;
// Método para leer edad
public int _____() {
    return edad;
}`,
        options: ["getEdad", "setEdad", "leerEdad", "edad"], correct: 0,
        explanation: "Convención JavaBean: get + NombreAtributoCapitalizado."
    },
    {
        module: "Módulo 3: Encapsulation", title: "Setter",
        code: `private String email;
// Método para modificar email
public void _____(String e) {
    this.email = e;
}`,
        options: ["getEmail", "setEmail", "putEmail", "write"], correct: 1,
        explanation: "Convención JavaBean: set + NombreAtributoCapitalizado."
    },
    {
        module: "Módulo 3: Encapsulation", title: "Setter con Lógica",
        code: `public void setEdad(int e) {
    // Validación de integridad
    if (e > 0) {
        this.edad = _____;
    }
}`,
        options: ["e", "edad", "0", "this"], correct: 0,
        explanation: "Asignamos el parámetro 'e' al atributo 'this.edad'."
    },
    {
        module: "Módulo 3: Encapsulation", title: "Constructor Private",
        code: `// Impide hacer 'new Singleton()' desde fuera
_____ Singleton() { }`,
        options: ["public", "private", "void", "static"], correct: 1,
        explanation: "Un constructor privado se usa en patrones como Singleton para controlar la creación de instancias."
    },
    {
        module: "Módulo 3: Encapsulation", title: "Paquetes",
        code: `// Declarar que esta clase vive en una carpeta
_____ com.miempresa.app;`,
        options: ["import", "package", "namespace", "using"], correct: 1,
        explanation: "'package' define el namespace de la clase."
    },
    {
        module: "Módulo 3: Encapsulation", title: "Importar",
        code: `// Usar una clase de otro paquete
_____ java.util.ArrayList;`,
        options: ["package", "include", "import", "use"], correct: 2,
        explanation: "'import' trae clases externas a tu archivo actual."
    },
    {
        module: "Módulo 3: Encapsulation", title: "Protected",
        code: `// Accesible por hijos y mismo paquete
_____ void metodoInterno() { }`,
        options: ["private", "protected", "public", "friend"], correct: 1,
        explanation: "'protected' permite acceso a subclases y clases del mismo package."
    },
    {
        module: "Módulo 3: Encapsulation", title: "Inmutabilidad",
        code: `// Clase que no se puede heredar
public _____ class Seguridad { }`,
        options: ["static", "final", "const", "abstract"], correct: 1,
        explanation: "'final' en una clase impide que sea extendida (heredada)."
    },

    // ==========================================
    // MÓDULO 4: HERENCIA - 10 Tickets
    // ==========================================
    {
        module: "Módulo 4: Herencia", title: "Extender",
        code: `// Empleado es hijo de Persona
public class Empleado _____ Persona { }`,
        options: ["implements", "extends", "uses", "super"], correct: 1,
        explanation: "'extends' establece la relación de herencia."
    },
    {
        module: "Módulo 4: Herencia", title: "Llamar al Padre",
        code: `public Empleado() {
    // Llamar al constructor de Persona
    _____();
}`,
        options: ["this", "parent", "super", "base"], correct: 2,
        explanation: "'super()' llama al constructor de la clase padre."
    },
    {
        module: "Módulo 4: Herencia", title: "Override",
        code: `// Reescribir método del padre
_____
public void trabajar() { 
    System.out.println("Trabajando duro");
}`,
        options: ["@Override", "@Overwrite", "@New", "@Super"], correct: 0,
        explanation: "@Override verifica que realmente existe el método en el padre."
    },
    {
        module: "Módulo 4: Herencia", title: "Clase Abstracta",
        code: `// No se puede instanciar, solo heredar
public _____ class Animal { }`,
        options: ["virtual", "abstract", "static", "void"], correct: 1,
        explanation: "'abstract' define una clase base conceptual."
    },
    {
        module: "Módulo 4: Herencia", title: "Método Abstracto",
        code: `// Hijos ESTÁN OBLIGADOS a implementarlo
public abstract void hacerRuido();`,
        options: ["Si", "No"], correct: 0,
        explanation: "Un método abstracto no tiene cuerpo y fuerza a los hijos a definirlo."
    },
    {
        module: "Módulo 4: Herencia", title: "Interfaz",
        code: `// Contrato de comportamiento puro
public _____ Volador {
    void volar();
}`,
        options: ["class", "interface", "abstract", "extends"], correct: 1,
        explanation: "Una 'interface' define qué métodos debe tener una clase, sin implementación."
    },
    {
        module: "Módulo 4: Herencia", title: "Implementar Interfaz",
        code: `public class Pajaro _____ Volador {
    public void volar() { ... }
}`,
        options: ["extends", "implements", "inherits", "uses"], correct: 1,
        explanation: "Para interfaces usamos 'implements'."
    },
    {
        module: "Módulo 4: Herencia", title: "Polimorfismo",
        code: `// Guardar un Gato en una variable de tipo Animal
Animal miMascota = new ____();`,
        options: ["Animal", "Gato", "Object", "String"], correct: 1,
        explanation: "Podemos guardar un objeto hijo (Gato) en una referencia padre (Animal)."
    },
    {
        module: "Módulo 4: Herencia", title: "InstanceOf",
        code: `if (miMascota _____ Gato) {
    System.out.println("Es un gato");
}`,
        options: ["is", "as", "instanceof", "typeof"], correct: 2,
        explanation: "'instanceof' verifica el tipo real del objeto en tiempo de ejecución."
    },
    {
        module: "Módulo 4: Herencia", title: "Object",
        code: `// Todas las clases heredan implícitamente de...
public class Heroe extends _____ { }`,
        options: ["Main", "Object", "Class", "Root"], correct: 1,
        explanation: "En Java, 'Object' es la raíz de toda jerarquía de clases."
    },

    // ==========================================
    // MÓDULO 5: EXCEPCIONES - 10 Tickets
    // ==========================================
    {
        module: "Módulo 5: Excepciones", title: "Try Catch",
        code: `_____ {
    codigoPeligroso();
} catch (Exception e) {
    manejarError();
}`,
        options: ["try", "attempt", "do", "test"], correct: 0,
        explanation: "'try' define el bloque seguro donde buscamos excepciones."
    },
    {
        module: "Módulo 5: Excepciones", title: "Catch Específico",
        code: `try { ... } 
catch (_____ e) {
    System.out.println("Error de matemáticas");
}`,
        options: ["Exception", "ArithmeticException", "Error", "Throwable"], correct: 1,
        explanation: "Es buena práctica atrapar excepciones específicas como ArithmeticException antes que las genéricas."
    },
    {
        module: "Módulo 5: Excepciones", title: "Finally",
        code: `try { db.open(); }
catch { log.error(); }
_____ {
    // Siempre ocurre
    db.close();
}`,
        options: ["final", "finish", "finally", "end"], correct: 2,
        explanation: "'finally' es crítico para liberar recursos."
    },
    {
        module: "Módulo 5: Excepciones", title: "Throw",
        code: `if (edad < 0) {
    // Lanzar error manualmente
    _____ new IllegalArgumentException("Edad negativa");
}`,
        options: ["return", "catch", "throw", "throws"], correct: 2,
        explanation: "'throw' lanza una excepción instanciada."
    },
    {
        module: "Módulo 5: Excepciones", title: "Throws en Firma",
        code: `// Avisar que este método PUEDE fallar
public void leer() _____ IOException {
    ...
}`,
        options: ["throw", "throws", "catch", "exception"], correct: 1,
        explanation: "'throws' (con s) va en la firma del método para advertir al compilador."
    },
    {
        module: "Módulo 5: Excepciones", title: "Unchecked Exception",
        code: `// NullPointerException es del tipo...
String s = null;
s.length(); // Crash!`,
        options: ["Checked", "Runtime (Unchecked)", "Error", "Fatal"], correct: 1,
        explanation: "Las RuntimeExceptions no te obligan a usar try-catch, pero explotan si no tienes cuidado."
    },
    {
        module: "Módulo 5: Excepciones", title: "Checked Exception",
        code: `// IOException requiere try-catch obligatorio
File f = new File("a.txt");
f.createNewFile();`,
        options: ["Checked", "Runtime", "Free", "Safe"], correct: 0,
        explanation: "Las 'Checked Exceptions' (como IOException) obligan al programador a manejarlas al compilar."
    },
    {
        module: "Módulo 5: Excepciones", title: "Custom Exception",
        code: `// Crear mi propio error
public class MiError _____ Exception { }`,
        options: ["implements", "extends", "throws", "uses"], correct: 1,
        explanation: "Para crear una excepción propia, heredamos de Exception o RuntimeException."
    },
    {
        module: "Módulo 5: Excepciones", title: "Get Message",
        code: `catch (Exception e) {
    // Ver el texto del error
    System.out.println(e._____());
}`,
        options: ["text", "toString", "getMessage", "info"], correct: 2,
        explanation: "getMessage() devuelve la descripción del error."
    },
    {
        module: "Módulo 5: Excepciones", title: "Print Stack Trace",
        code: `catch (Exception e) {
    // Imprimir toda la traza de llamadas
    e._____();
}`,
        options: ["printTrace", "printStackTrace", "log", "dump"], correct: 1,
        explanation: "printStackTrace() muestra la pila de llamadas donde ocurrió el error, crucial para debugging."
    }
];
