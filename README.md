# AvansSecurity2

- De server bepaalt allereerst of de client een bericht wilt versturen of opvragen (op basis van een wel of niet ingevulde berichtbox).
- Voor het hashen en vergelijken van wachtwoorden is de library 'bcrypt' gebruikt.
- Het bericht wordt na ontvangst door de server versleuteld (aes-256-ctr) met als geheim de password-hash van de gebruiker. Hiervoor is de library 'cryptr' gebruikt.

Belangrijk is dat de database en webservice gescheiden blijven, zodat iemand die de database in handen krijgt de berichten zonder kennis van de logica niet kan ontsleutelen.