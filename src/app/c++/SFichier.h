/****************************************************************************
 *  Classe: 			SFichier			     																				*
 *  Auteur: 			Mariane Maynard 																					*
 *	Description:	Representation d'un fichier ouvert sur le serveur	      	*
 ****************************************************************************/

#ifndef SFICHIER
#define SFICHIER

#include <string>
#include <iostream>
#include <fstream>
#include "Fichier.h"

using std::string;
using std::ifstream;
using boost::shared_ptr;
using std::endl;
using std::cout;

class SFichier : public Fichier
{
	private:
		string _contenu;

  public:
		SFichier(const string &contenu)
			: _contenu(contenu)
		{}

		SFichier(const char* filename)
		{
			ifstream file;
			file.open(filename);
			file >> _contenu;
			file.close();
		}

		virtual void ecrireSurDisque() override {}

		virtual void inserer(const char *data, uint position, size_t taille) override
		{_contenu.insert(position, data, taille);}

		virtual void supprimer(uint position, size_t taille) override
		{_contenu.erase(position, taille);}

		virtual void printContenu() override
		{cout << _contenu << endl;}
};

//Implementation des factory method pour string
template<> shared_ptr<Fichier> Fichier::CreateFichier(const char* filename, string)
{
	return shared_ptr<Fichier>(static_cast<Fichier*>(new SFichier(filename)));
}

template<> shared_ptr<Fichier> Fichier::CreateFichier(const string &contenu)
{
	return shared_ptr<Fichier>(static_cast<Fichier*>(new SFichier(contenu)));
}

#endif //SFICHIER

//c++ -pthread -fexceptions -O2 -I/usr/local/include/stlport -std=c++11 -c -o Fichier.o ./src/app/c++/Fichier.h
//c++ -pthread -fexceptions -O2 -I/usr/local/include/stlport -o Fichier Fichier.o -lstlport

//g++ -I/usr/local/include/stlport -std=c++11 -c -o Fichier.o Fichier.cpp
//g++ -pthread -I/usr/local/include/stlport -o Fichier Fichier.o -lstlport
