const Sauce = require('../models/Sauce');
const fs = require('fs');


exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré '}))
      .catch(err => res.status(400).json({ err }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
      ...JSON.parse(req.body.sauce), 
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet modifié !'}))
      .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        if (!sauce) {
          return res.status(404).json({ error: new Error('Sauce non trouvée') });
        };
        if (sauce.userId !== req.auth.userId) {
          return res.status(404).json({ error: new Error("Requête non authorisée") })
        } else {
            const filename = sauce.imageUrl.split('images/')[1];

            fs.unlink(`images/${filename}`, () => {
              Sauce.deleteOne({ _id: req.params.id })
              .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
              .catch(error => res.status(400).json({ error }));
            })
          }        
      });    
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({ error: new Error('Sauce non trouvée')})
      }
      if (req.body.like === 1) {
        if (!sauce.usersLiked.includes(req.body.userId)) {
          try {
            Sauce.findByIdAndUpdate(
              req.params.id,
              {
                $addToSet: { usersLiked: req.body.userId },
                $inc: { likes: 1 }
              },
              { new: true },
              (err, docs) => {
                if (err) return res.status(400).json({ err })
                else return res.status(200).json({ docs })
              }
            );
          } catch (err) {
            return res.status(400).json({ err })
          }
        }
      }

      else if (req.body.like === 0) {
        if (sauce.usersLiked.includes(req.body.userId)) {
          try {
            Sauce.findByIdAndUpdate(
              req.params.id,
              {
                $pull: { usersLiked: req.body.userId },
                $inc: { likes: -1 }
              },
              {new: true },
              (err, docs) => {
                if (err) return res.status(400).json({ err })
                else return res.status(200).json({ docs })
              }
            )
          } catch (err) {
            return res.status(400).json({ err })
          }
        }
        if (sauce.usersDisliked.includes(req.body.userId)) {
          try {
            Sauce.findByIdAndUpdate(
              req.params.id,
              {
                $pull: { usersDisliked: req.body.userId },
                $inc: { dislikes: -1 }
              },
              {new: true },
              (err, docs) => {
                if (err) return res.status(400).json({ err })
                else return res.status(200).json({ docs })
              }
            )
          } catch (err) {
            return res.status(400).json({ err })
          }
        }
      }

      else if (req.body.like === -1) {
        if (!sauce.usersDisliked.includes(req.body.userId)) {
          try {
            Sauce.findByIdAndUpdate(
              req.params.id,
              {
                $addToSet: { usersDisliked: req.body.userId },
                $inc: { dislikes: 1 }
              },
              { new: true },
              (err, docs) => {
                if (err) return res.status(400).json({ err })
                else return res.status(200).json({ docs })
              }
            );
          } catch (err) {
            return res.status(400).json({ err })
          }
        }
      }
      
    })
};