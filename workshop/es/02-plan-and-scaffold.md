<!-- l10n-sync: source-file="02-plan-and-scaffold.md" -->
# Parte 2: Planificación y estructura inicial

---

Antes de escribir código, vamos a usar los flujos de planificación de Copilot para diseñar la arquitectura. Planificar primero ayuda a crear mejores sistemas y proporciona a Copilot el contexto necesario para generar código de mayor calidad.

## Tarea 1: Planifica la arquitectura de la API

<!-- track:vscode:start -->
1. Cambia al modo **Plan** en Copilot Chat (haz clic en el selector de modo, en la parte inferior del panel de chat).
<!-- track:vscode:end -->

<!-- track:cli:start -->
1. Activa el **modo de planificación** en Copilot CLI pulsando **Shift+Tab** hasta que cambie el modo, o usa `/plan`.
<!-- track:cli:end -->

2. Introduce este prompt:

   ```
   I need to build a server-side API proxy that fetches GitHub contribution data
   for any username. The endpoint is https://github.com/{username}.contribs which
   returns JSON. We need to bypass CORS restrictions. Plan the implementation
   including the route structure, error handling, and caching strategy.
   ```

3. **Revisa el plan**: aquí es donde la planificación resulta útil. No aceptes sin más la primera respuesta:
   - Pide aclaraciones sobre cualquier aspecto que no esté claro.
   - Sugiere cambios si algo no te convence.
   - Itera hasta que estés satisfecho con el enfoque.

<!-- track:vscode:start -->
4. Cuando estés satisfecho con el plan, pide a Copilot que lo implemente: cambia al modo **Agent** y dile que continúe.
<!-- track:vscode:end -->

<!-- track:cli:start -->
4. Cuando estés satisfecho con el plan, pide a Copilot CLI que continúe con la implementación.
5. Revisa los cambios de los archivos con `/diff` antes de aprobarlos.
<!-- track:cli:end -->

6. **Resultado:** ahora debería haberse creado una ruta de API en:

   ```
   src/pages/api/contributions/[username].ts
   ```

## Tarea 2: Prueba la API

> **⚠️ ¿No ves los cambios?** Si el servidor de desarrollo no detecta la nueva ruta, detenlo (`Ctrl+C`) y reinícialo con `npm run dev`.

1. Comprueba que el servidor de desarrollo esté en marcha y prueba el endpoint:

   ```bash
   curl http://localhost:4321/api/contributions/octocat
   ```

2. Deberías recibir datos de contribuciones en formato JSON.
3. Prueba también el caso de error: introduce un nombre de usuario no válido y confirma que se devuelve una respuesta de error adecuada.

## Tarea 3: Planifica la página de batalla

<!-- track:vscode:start -->
1. Mantén el modo **Plan** e introduce este prompt:
<!-- track:vscode:end -->

<!-- track:cli:start -->
1. Mantén el modo de planificación (o ejecuta `/plan`) e introduce este prompt:
<!-- track:cli:end -->

   ```
   Now I need the main page. Plan a battle page for "Mona Mayhem - GitHub
   Contribution Battle Arena" with: two username inputs (Player 1 and Player 2),
   a battle button, and a results area. Keep the UI simple — don't over-engineer
   the layout or styling at this stage. Plan the HTML structure, basic styling,
   and how the battle interaction will work.
   ```

2. **Revisa el plan e itera**: haz preguntas, sugiere cambios y perfecciona el enfoque.

<!-- track:vscode:start -->
3. Cuando estés satisfecho, cambia al modo **Agent** y deja que Copilot cree la página.
<!-- track:vscode:end -->

<!-- track:cli:start -->
3. Cuando estés satisfecho, pide a Copilot CLI que implemente el plan aprobado.
4. Vuelve a usar `/diff` para revisar la estructura HTML y CSS antes de aprobarla.
<!-- track:cli:end -->

## Tarea 4: Comprueba la estructura inicial

> **⚠️ ¿No ves los cambios?** Si la página no se ve bien o no se ha actualizado, detén el servidor de desarrollo (`Ctrl+C`), reinícialo con `npm run dev` y actualiza el navegador.

1. Abre http://localhost:4321 en el navegador.
2. Deberías ver:
   - El título del juego.
   - Dos campos para los nombres de usuario (Player 1 y Player 2).
   - Un botón de batalla.
3. El botón todavía no funcionará, y es lo esperado: aún no hemos conectado la lógica de interacción. Eso viene a continuación.

---

## ✅ ¡Parte 2 completada!

Has aprendido a:

- **Planificar antes de programar** en lugar de empezar directamente con la implementación.
- **Iterar sobre los planes** hasta que la arquitectura tenga sentido.
- **Pasar del plan a la implementación** con un flujo de trabajo más claro y seguro.
