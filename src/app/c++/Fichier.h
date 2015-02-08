/****************************************************************************
 *  Classe: 			Modification     																					*
 *  Auteur: 			Mariane Maynard 																					*
 *	Description:	Representation d'un fichier ouvert sur le serveur	      	*
 ****************************************************************************/

#include <rope>
#include <iostream>

#ifndef FICHIER
#define FICHIER

using std::crope;

class Fichier
{
	private:
		crope _contenu;
  public:
		Fichier(crope &contenu)
			: _contenu(contenu)
		{}

		Fichier(const char* filename)
		{
			//auto cp = new file_char_prod(filename);
			//_contenu = crope{cp, cp->len(), true};	//cp est detruit par crope
		}

		void ecrireSurDisque() {}

		void inserer(const char *data, uint position, size_t taille)
		{_contenu.insert(position, data, taille);}

		void supprimer(uint position, size_t taille)
		{_contenu.erase(position, taille);}
};

#endif //FICHIER

int main()
{
	Fichier("test");
	std::cout << "Hello" << std::endl;
}

//c++ -pthread -fexceptions -O2 -I/usr/local/include/stlport -std=c++11 -c -o Fichier.o ./src/app/c++/Fichier.h
//c++ -pthread -fexceptions -O2 -I/usr/local/include/stlport -o Fichier Fichier.o -lstlport

//g++ -I/usr/local/include/stlport -std=c++11 -c -o Fichier.o Fichier.cpp
//g++ -pthread -I/usr/local/include/stlport -o Fichier Fichier.o -lstlport
