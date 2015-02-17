/****************************************************************************
 *  Classe: 			Fichier			     																					*
 *  Auteur: 			Mariane Maynard 																					*
 *	Description:	Representation d'un fichier ouvert sur le serveur	      	*
 ****************************************************************************/

#ifndef FICHIER
#define FICHIER

using std::string;
using boost::shared_ptr;

struct Fichier
{
	//Factory methods
	template <class T>
		static shared_ptr<Fichier> CreateFichier(const char* filename, T);

	template <class T>
		static shared_ptr<Fichier> CreateFichier(const T &contenu);

	virtual ~Fichier() = default;
	virtual void ecrireSurDisque() = 0;
	virtual void inserer(const char *data, uint position, size_t taille) = 0;
	virtual void supprimer(uint position, size_t taille) = 0;
	virtual void printContenu() = 0;	//Fonction de debug
};

#endif //FICHIER
