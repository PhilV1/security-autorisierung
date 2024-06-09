# BE - Sicherheit - 06: Autorisierung

> Lernziele
> Autorisierung
> - Benutzer können eine Rolle haben
> - Erstellung einer Middleware zum Schutz von Routen abhängig von der Benutzerrolle

## Autorisierung

- Bisher haben wir nur über Benutzer-_Authentifizierung_ gesprochen

- Normalerweise haben verschiedene Benutzer Zugang zu verschiedenen Teilen unserer App
    - Alle Benutzer können `GET /posts` ausführen
    - Nur Administratoren können `DELETE /posts/:id` ausführen


### Einfache rollenbasierte

- Deine App hat Benutzer und einige Rollen: Admin, Benutzer, Editor, Moderator...
    - Deine Benutzer haben vielleicht eine spezifische Rolle
    - Deine Benutzer haben vielleicht mehrere Rollen gleichzeitig

- Einige Endpunkte erfordern spezifische Rollen, um zu funktionieren

    ```js
    app.delete('/foo/:id', authenticated, roles(['admin']), (req,res) => {
        
    })
    ```

### Berechtigungsbasiert

- Deine App hat Benutzer und viele Berechtigungen
    - Deine Benutzer haben vielleicht eine Liste von gewährten Berechtigungen (ähnlich wie Rollen)
        - EDIT_POSTS
        - DELETE_POSTS
        - DELETE_USER
        - ...


## Zusammenfassung

- Authentifizierung: Wer bist Du?
- Autorisierung: Was darfst Du tun?

