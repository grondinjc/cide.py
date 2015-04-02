/****************************************************************************
 *  Classe:       SFichier                                                  *
 *  Auteur:       Mariane Maynard                                           *
 *  Description:  Representation d'un fichier ouvert sur le serveur         *
 ****************************************************************************/

#ifndef SFICHIER
#define SFICHIER

#include <string>
#include <iostream>
#include <fstream>
#include "Fichier.h"
#include "Types.h"

using std::string;
using std::ifstream;
using std::endl;
using std::cout;
using namespace types;

template <>
  class FichierType<string>
  {
    private:
      string _contenu;

    public:
      FichierType() = default;

      FichierType(const string &contenu)
        : _contenu(contenu)
      {}

      FichierType(const char* filename)
      {
        ifstream file;
        file.open(filename);
        file >> _contenu;
        file.close();
      }

      ~FichierType() = default;

      void ecrireSurDisque() {}

      void inserer(const char *data, pos_t position, taille_t taille)
      {_contenu.insert(position, data, taille);}

      void supprimer(pos_t position, taille_t taille)
      {_contenu.erase(position, taille);}

      void printContenu()
      {cout << _contenu << endl;}

      string getContenu() const {return _contenu;}
      size_t getTaille() const {return _contenu.size();}
  };

#endif //SFICHIER

//c++ -pthread -fexceptions -O2 -I/usr/local/include/stlport -std=c++11 -c -o Fichier.o ./src/app/c++/Fichier.h
//c++ -pthread -fexceptions -O2 -I/usr/local/include/stlport -o Fichier Fichier.o -lstlport

//g++ -I/usr/local/include/stlport -std=c++11 -c -o Fichier.o Fichier.cpp
//g++ -pthread -I/usr/local/include/stlport -o Fichier Fichier.o -lstlport
