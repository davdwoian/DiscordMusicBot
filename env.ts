/** define necessary environment variable for the application, use .env or any other approach to fetch those variables */
interface ENV {
	/** google api v3 key */
	API_YOUTUBE_KEY: string
	/** discord bot id */
	CLIENT_ID: string
	/** discord bot token */
	CLIENT_TOKEN: string
	/** directly accessible mongodb address */
	DB_ADDR: string
}